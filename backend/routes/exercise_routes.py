import uuid
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models.schemas import ExerciseItem, ExerciseCategory, ExerciseLog, ExerciseLogCreate
from services.workout_db import get_all_exercises, get_exercise_by_id
from database import db_manager

router = APIRouter(prefix="/exercises", tags=["Exercises & Gym Workouts"])

@router.get("", response_model=List[ExerciseItem])
async def list_exercises(category: Optional[ExerciseCategory] = Query(None)):
    """List curated gym exercises filtered by goal (overweight, weight_loss, muscle_gain, athletic)."""
    return get_all_exercises(category)

@router.get("/{exercise_id}", response_model=ExerciseItem)
async def get_exercise(exercise_id: str):
    ex = get_exercise_by_id(exercise_id)
    if not ex:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return ex

@router.post("/log", response_model=ExerciseLog)
async def log_exercise(payload: ExerciseLogCreate):
    """Log an exercise completed today, recording calories burned and reps/sets."""
    user_col = db_manager.get_users_collection()
    user = await user_col.find_one({"id": payload.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    workout_id = str(uuid.uuid4())
    doc = {
        "id": workout_id,
        "user_id": payload.user_id,
        "exercise_id": payload.exercise_id,
        "exercise_name": payload.exercise_name,
        "date": payload.date,
        "duration_minutes": float(payload.duration_minutes),
        "sets": payload.sets,
        "reps": payload.reps,
        "weight_kg": float(payload.weight_kg or 0.0),
        "calories_burned": round(float(payload.calories_burned), 1),
        "notes": payload.notes or "",
        "created_at": datetime.utcnow().isoformat()
    }
    col = db_manager.get_workouts_collection()
    await col.insert_one(doc)
    return doc

@router.get("/logs/daily", response_model=List[ExerciseLog])
async def get_daily_workout_logs(
    user_id: str = Query(...),
    date: str = Query(...)
):
    """Retrieve all exercises logged by a user for a specific date."""
    col = db_manager.get_workouts_collection()
    cursor = await col.find({"user_id": user_id, "date": date})
    logs = await cursor.to_list(length=100)
    return logs

@router.delete("/logs/{log_id}")
async def delete_workout_log(log_id: str):
    col = db_manager.get_workouts_collection()
    res = await col.delete_one({"id": log_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Workout log not found")
    return {"message": "Workout log deleted successfully"}

