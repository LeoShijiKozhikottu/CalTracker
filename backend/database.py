import os
import json
import logging
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime

# Set fast DNS resolution timeout before Motor/PyMongo imports so SRV lookups never hang
try:
    import dns.resolver
    _base_init = dns.resolver.Resolver.__init__
    def _fast_resolver_init(res_self, *args, **kwargs):
        _base_init(res_self, *args, **kwargs)
        res_self.timeout = 1.5
        res_self.lifetime = 2.0
    dns.resolver.Resolver.__init__ = _fast_resolver_init
except Exception:
    pass

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCursor
from config import settings

logger = logging.getLogger("caltracker.database")

# Enable compatibility so that 'await col.find(...)' and 'col.find(...)' both work seamlessly with Motor
def _motor_cursor_await(self):
    async def _identity():
        return self
    return _identity().__await__()

AsyncIOMotorCursor.__await__ = _motor_cursor_await

def _matches_query(item: Dict[str, Any], query: Optional[Dict[str, Any]]) -> bool:
    if not query:
        return True
    for k, v in query.items():
        if k in ("_id", "id"):
            item_id = item.get("id") or item.get("_id")
            if str(item_id) != str(v):
                return False
        elif item.get(k) != v:
            return False
    return True

class LocalFallbackCollection:
    """A thread-safe local JSON storage fallback when MongoDB server is not reachable."""
    def __init__(self, filename: str):
        self.filename = filename
        self._ensure_file()

    def _ensure_file(self):
        os.makedirs(os.path.dirname(self.filename), exist_ok=True)
        if not os.path.exists(self.filename):
            with open(self.filename, "w", encoding="utf-8") as f:
                json.dump([], f)

    def _read_data(self) -> List[Dict[str, Any]]:
        try:
            with open(self.filename, "r", encoding="utf-8") as f:
                data = json.load(f)
                for item in data:
                    if isinstance(item, dict):
                        if "id" not in item and "_id" in item:
                            item["id"] = str(item["_id"])
                        elif "_id" not in item and "id" in item:
                            item["_id"] = str(item["id"])
                return data
        except Exception:
            return []

    def _write_data(self, data: List[Dict[str, Any]]):
        with open(self.filename, "w", encoding="utf-8") as f:
            json.dump(data, f, default=str, indent=2)

    async def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        items = self._read_data()
        return sum(1 for item in items if _matches_query(item, query))

    async def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        items = self._read_data()
        for item in items:
            if _matches_query(item, query):
                return item
        return None

    def find(self, query: Optional[Dict[str, Any]] = None) -> Any:
        items = self._read_data()
        matched = [item for item in items if _matches_query(item, query)]
        
        class Cursor:
            def __init__(self, data):
                self.data = data
            def __await__(self):
                async def _identity():
                    return self
                return _identity().__await__()
            async def to_list(self, length: Optional[int] = None):
                if length is None:
                    return self.data
                return self.data[:length]
            def sort(self, field, direction=1):
                reverse = direction == -1
                self.data = sorted(self.data, key=lambda x: x.get(field, ""), reverse=reverse)
                return self
        
        return Cursor(matched)

    async def insert_one(self, doc: Dict[str, Any]):
        items = self._read_data()
        if "id" not in doc and "_id" in doc:
            doc["id"] = str(doc["_id"])
        elif "_id" not in doc and "id" in doc:
            doc["_id"] = str(doc["id"])
        items.append(doc)
        self._write_data(items)
        class InsertResult:
            inserted_id = doc.get("id", doc.get("_id", "gen-id"))
        return InsertResult()

    async def insert_many(self, docs: List[Dict[str, Any]]):
        items = self._read_data()
        for doc in docs:
            if "id" not in doc and "_id" in doc:
                doc["id"] = str(doc["_id"])
            elif "_id" not in doc and "id" in doc:
                doc["_id"] = str(doc["id"])
            items.append(doc)
        self._write_data(items)

    async def update_one(self, query: Dict[str, Any], update: Dict[str, Any]):
        items = self._read_data()
        updated = False
        set_values = update.get("$set", {})
        for idx, item in enumerate(items):
            if _matches_query(item, query):
                items[idx].update(set_values)
                updated = True
                break
        if updated:
            self._write_data(items)
        class UpdateResult:
            modified_count = 1 if updated else 0
        return UpdateResult()

    async def delete_one(self, query: Dict[str, Any]):
        items = self._read_data()
        new_items = []
        deleted = False
        for item in items:
            if _matches_query(item, query) and not deleted:
                deleted = True
                continue
            new_items.append(item)
        if deleted:
            self._write_data(new_items)
        class DeleteResult:
            deleted_count = 1 if deleted else 0
        return DeleteResult()

class DatabaseManager:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.use_fallback = False
        self._fallback_users = None
        self._fallback_meals = None
        self._fallback_auth = None
        self._fallback_workouts = None

    async def connect(self):
        try:
            logger.info(f"Connecting to MongoDB at {settings.MONGO_URI}...")
            self.client = AsyncIOMotorClient(
                settings.MONGO_URI,
                serverSelectionTimeoutMS=2000,
                connectTimeoutMS=2000
            )
            await asyncio.wait_for(self.client.admin.command('ping'), timeout=2.5)
            self.db = self.client[settings.DB_NAME]
            self.use_fallback = False
            logger.info("Successfully connected to MongoDB!")

            # Auto-seed initial datasets into MongoDB if collections are empty
            await self._seed_mongo_if_empty()
        except Exception as e:
            logger.warning(f"MongoDB connection failed: {e}. Falling back to resilient local datastore.")
            self._init_fallback()

    async def _seed_mongo_if_empty(self):
        try:
            base_dir = os.path.join(os.path.dirname(__file__), "data")
            mapping = [
                ("users", "users.json"),
                ("auth", "auth.json"),
                ("meals", "meals.json"),
                ("workouts", "workouts.json")
            ]
            for col_name, filename in mapping:
                col = self.db[col_name]
                cnt = await col.count_documents({})
                if cnt == 0:
                    filepath = os.path.join(base_dir, filename)
                    if os.path.exists(filepath):
                        with open(filepath, "r", encoding="utf-8") as f:
                            data = json.load(f)
                        if data:
                            await col.insert_many(data)
                            logger.info(f"Seeded {len(data)} documents into MongoDB collection '{col_name}'.")
        except Exception as seed_err:
            logger.warning(f"Error during initial MongoDB seeding: {seed_err}")

    def _init_fallback(self):
        base_dir = os.path.join(os.path.dirname(__file__), "data")
        self.use_fallback = True
        self._fallback_users = LocalFallbackCollection(os.path.join(base_dir, "users.json"))
        self._fallback_meals = LocalFallbackCollection(os.path.join(base_dir, "meals.json"))
        self._fallback_auth = LocalFallbackCollection(os.path.join(base_dir, "auth.json"))
        self._fallback_workouts = LocalFallbackCollection(os.path.join(base_dir, "workouts.json"))

    def get_users_collection(self) -> Any:
        if self.use_fallback or self.db is None:
            if not self._fallback_users:
                self._init_fallback()
            return self._fallback_users
        return self.db["users"]

    def get_meals_collection(self) -> Any:
        if self.use_fallback or self.db is None:
            if not self._fallback_meals:
                self._init_fallback()
            return self._fallback_meals
        return self.db["meals"]

    def get_auth_collection(self) -> Any:
        if self.use_fallback or self.db is None:
            if not self._fallback_auth:
                self._init_fallback()
            return self._fallback_auth
        return self.db["auth"]

    def get_workouts_collection(self) -> Any:
        if self.use_fallback or self.db is None:
            if not self._fallback_workouts:
                self._init_fallback()
            return self._fallback_workouts
        return self.db["workouts"]

    async def close(self):
        if self.client:
            self.client.close()
            logger.info("MongoDB connection closed.")

db_manager = DatabaseManager()
