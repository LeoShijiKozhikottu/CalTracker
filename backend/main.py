import os
import sys
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure the backend directory is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from config import settings
from database import db_manager
from routes.profile_routes import router as profile_router, ensure_seed_profiles
from routes.meal_routes import router as meal_router
from routes.vision_routes import router as vision_router
from routes.recommendation_routes import router as recommendation_router
from routes.auth_routes import router as auth_router, ensure_seed_auth
from routes.exercise_routes import router as exercise_router
from routes.community_routes import router as community_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("caltracker.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting CalTracker API server...")
    await db_manager.connect()
    try:
        await ensure_seed_profiles()
        await ensure_seed_auth()
    except Exception as e:
        logger.warning(f"Seed initialization note: {e}")
    yield
    logger.info("Shutting down CalTracker API...")
    await db_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Backend API for gym calorie tracking, AI food detection, personalized diet plans, exercises, and friends progress comparison.",
    lifespan=lifespan
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(profile_router, prefix=settings.API_V1_STR)
app.include_router(meal_router, prefix=settings.API_V1_STR)
app.include_router(vision_router, prefix=settings.API_V1_STR)
app.include_router(recommendation_router, prefix=settings.API_V1_STR)
app.include_router(exercise_router, prefix=settings.API_V1_STR)
app.include_router(community_router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Welcome to CalTracker API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "database": "mongodb" if not db_manager.use_fallback else "local_resilient_store",
        "vision_ai": "active" if bool(settings.GEMINI_API_KEY) else "heuristic_fallback_ready"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=settings.PORT, reload=True)
