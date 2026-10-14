import uuid
import hashlib
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from models.schemas import (
    UserRegister,
    UserLogin,
    AuthToken,
    UserProfile,
    FitnessGoal,
    ActivityLevel,
    DietStyle
)
from services.diet_calculator import calculate_targets
from database import db_manager

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    """Hash password using SHA-256 with a project salt."""
    salt = "caltracker_secure_salt_2026"
    return hashlib.sha256(f"{salt}_{password}".encode("utf-8")).hexdigest()

DEMO_USERS = [
    {
        "name": "Rahul (Bulking Goal)",
        "email": "rahul@gym.com",
        "password": "rahul123",
        "age": 24,
        "gender": "male",
        "height_cm": 178.0,
        "weight_kg": 72.0,
        "activity_level": ActivityLevel.VERY_ACTIVE,
        "fitness_goal": FitnessGoal.BULKING,
        "diet_style": DietStyle.HIGH_PROTEIN
    },
    {
        "name": "Sneha (Cutting / Fat Loss)",
        "email": "sneha@gym.com",
        "password": "sneha123",
        "age": 23,
        "gender": "female",
        "height_cm": 162.0,
        "weight_kg": 64.0,
        "activity_level": ActivityLevel.MODERATELY_ACTIVE,
        "fitness_goal": FitnessGoal.CUTTING,
        "diet_style": DietStyle.BALANCED
    },
    {
        "name": "Vikram (Vegetarian Gymmer)",
        "email": "vikram@gym.com",
        "password": "vikram123",
        "age": 26,
        "gender": "male",
        "height_cm": 182.0,
        "weight_kg": 78.0,
        "activity_level": ActivityLevel.VERY_ACTIVE,
        "fitness_goal": FitnessGoal.BULKING,
        "diet_style": DietStyle.VEGETARIAN
    },
    {
        "name": "Priya (Overweight Safe Fat Loss)",
        "email": "priya@gym.com",
        "password": "priya123",
        "age": 28,
        "gender": "female",
        "height_cm": 165.0,
        "weight_kg": 92.0,
        "activity_level": ActivityLevel.LIGHTLY_ACTIVE,
        "fitness_goal": FitnessGoal.OVERWEIGHT_LOSS,
        "diet_style": DietStyle.LOW_CARB
    }
]

async def ensure_seed_auth():
    """Seed demo accounts only if database is completely empty."""
    user_col = db_manager.get_users_collection()
    cursor = user_col.find({})
    existing_users = await cursor.to_list(length=1)
    if existing_users:
        return

@router.post("/register", response_model=AuthToken)
async def register(payload: UserRegister):
    """Register a new user account with personalized fitness goals and Mifflin-St Jeor calculations."""
    auth_col = db_manager.get_auth_collection()
    email_clean = payload.email.lower().strip()
    
    existing = await auth_col.find_one({"email": email_clean})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    targets = calculate_targets(
        weight_kg=payload.weight_kg,
        height_cm=payload.height_cm,
        age=payload.age,
        gender=payload.gender,
        activity_level=payload.activity_level,
        fitness_goal=payload.fitness_goal,
        diet_style=payload.diet_style,
        custom_calories=payload.custom_calorie_target,
        custom_protein=payload.custom_protein_target
    )

    profile_id = str(uuid.uuid4())
    user_doc = {
        "id": profile_id,
        "name": payload.name.strip(),
        "email": email_clean,
        "age": payload.age,
        "gender": payload.gender,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "activity_level": payload.activity_level.value,
        "fitness_goal": payload.fitness_goal.value,
        "diet_style": payload.diet_style.value,
        "bmr": targets["bmr"],
        "tdee": targets["tdee"],
        "target_calories": targets["target_calories"],
        "target_macros": targets["target_macros"].model_dump(),
        "target_micros": targets["target_micros"].model_dump(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    user_col = db_manager.get_users_collection()
    await user_col.insert_one(user_doc)

    account_doc = {
        "id": str(uuid.uuid4()),
        "email": email_clean,
        "password_hash": hash_password(payload.password),
        "profile_id": profile_id,
        "name": payload.name.strip(),
        "created_at": datetime.utcnow().isoformat()
    }
    await auth_col.insert_one(account_doc)

    token = f"token_{profile_id}_{uuid.uuid4().hex[:12]}"
    return AuthToken(
        access_token=token,
        token_type="bearer",
        user=UserProfile(**user_doc)
    )

@router.post("/login", response_model=AuthToken)
async def login(payload: UserLogin):
    """Log in an existing user with email and password."""
    await ensure_seed_auth()
    auth_col = db_manager.get_auth_collection()
    email_clean = payload.email.lower().strip()
    account = await auth_col.find_one({"email": email_clean})

    if not account or account.get("password_hash") != hash_password(payload.password):
        raise HTTPException(status_code=401, detail="Invalid email or password.")

    profile_id = account.get("profile_id")
    user_col = db_manager.get_users_collection()
    user_doc = await user_col.find_one({"id": profile_id})

    if not user_doc:
        raise HTTPException(status_code=404, detail="User profile associated with this account not found.")

    token = f"token_{profile_id}_{uuid.uuid4().hex[:12]}"
    return AuthToken(
        access_token=token,
        token_type="bearer",
        user=UserProfile(**user_doc)
    )

@router.get("/me/{profile_id}", response_model=UserProfile)
async def get_current_user(profile_id: str):
    user_col = db_manager.get_users_collection()
    user_doc = await user_col.find_one({"id": profile_id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")
    return UserProfile(**user_doc)

