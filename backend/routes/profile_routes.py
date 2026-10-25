import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import (
    UserProfile,
    UserProfileCreate,
    FitnessGoal,
    ActivityLevel,
    DietStyle
)
from services.diet_calculator import calculate_targets
from database import db_manager

router = APIRouter(prefix="/profiles", tags=["Profiles"])

DEFAULT_PROFILES = [
    {
        "name": "Rahul (Bulking Goal)",
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
        "age": 26,
        "gender": "male",
        "height_cm": 182.0,
        "weight_kg": 78.0,
        "activity_level": ActivityLevel.VERY_ACTIVE,
        "fitness_goal": FitnessGoal.BULKING,
        "diet_style": DietStyle.VEGETARIAN
    }
]

async def ensure_seed_profiles():
    # Auto-seeding disabled to maintain clean user account list
    pass

@router.get("", response_model=List[UserProfile])
async def list_profiles():
    col = db_manager.get_users_collection()
    cursor = col.find({})
    users = await cursor.to_list(length=100)
    return users

@router.post("", response_model=UserProfile)
async def create_profile(profile_in: UserProfileCreate):
    col = db_manager.get_users_collection()
    targets = calculate_targets(
        weight_kg=profile_in.weight_kg,
        height_cm=profile_in.height_cm,
        age=profile_in.age,
        gender=profile_in.gender,
        activity_level=profile_in.activity_level,
        fitness_goal=profile_in.fitness_goal,
        diet_style=profile_in.diet_style,
        custom_calories=profile_in.custom_calorie_target,
        custom_protein=profile_in.custom_protein_target
    )
    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "name": profile_in.name,
        "age": profile_in.age,
        "gender": profile_in.gender,
        "height_cm": profile_in.height_cm,
        "weight_kg": profile_in.weight_kg,
        "activity_level": profile_in.activity_level.value,
        "fitness_goal": profile_in.fitness_goal.value,
        "diet_style": profile_in.diet_style.value,
        "bmr": targets["bmr"],
        "tdee": targets["tdee"],
        "target_calories": targets["target_calories"],
        "target_macros": targets["target_macros"].model_dump(),
        "target_micros": targets["target_micros"].model_dump(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
    await col.insert_one(doc)
    return doc

@router.get("/{profile_id}", response_model=UserProfile)
async def get_profile(profile_id: str):
    col = db_manager.get_users_collection()
    user = await col.find_one({"id": profile_id})
    if not user:
        raise HTTPException(status_code=404, detail="Profile not found")
    return user

@router.put("/{profile_id}", response_model=UserProfile)
async def update_profile(profile_id: str, profile_in: UserProfileCreate):
    col = db_manager.get_users_collection()
    existing = await col.find_one({"id": profile_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    targets = calculate_targets(
        weight_kg=profile_in.weight_kg,
        height_cm=profile_in.height_cm,
        age=profile_in.age,
        gender=profile_in.gender,
        activity_level=profile_in.activity_level,
        fitness_goal=profile_in.fitness_goal,
        diet_style=profile_in.diet_style,
        custom_calories=profile_in.custom_calorie_target,
        custom_protein=profile_in.custom_protein_target
    )
    update_data = {
        "name": profile_in.name,
        "age": profile_in.age,
        "gender": profile_in.gender,
        "height_cm": profile_in.height_cm,
        "weight_kg": profile_in.weight_kg,
        "activity_level": profile_in.activity_level.value,
        "fitness_goal": profile_in.fitness_goal.value,
        "diet_style": profile_in.diet_style.value,
        "bmr": targets["bmr"],
        "tdee": targets["tdee"],
        "target_calories": targets["target_calories"],
        "target_macros": targets["target_macros"].model_dump(),
        "target_micros": targets["target_micros"].model_dump(),
        "updated_at": datetime.utcnow().isoformat()
    }
    await col.update_one({"id": profile_id}, {"$set": update_data})
    updated = await col.find_one({"id": profile_id})
    return updated

@router.delete("/{profile_id}")
async def delete_profile(profile_id: str):
    col = db_manager.get_users_collection()
    res = await col.delete_one({"id": profile_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile deleted successfully"}
