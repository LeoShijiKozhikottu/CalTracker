from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Query, HTTPException
from models.schemas import FriendComparisonItem
from database import db_manager

router = APIRouter(prefix="/community", tags=["Community & Friends"])

@router.get("/friends", response_model=List[FriendComparisonItem])
async def list_friends_progress(date: Optional[str] = None):
    """Retrieve all friends with their current day calorie and gym progress for comparison."""
    if not date:
        date = datetime.utcnow().strftime("%Y-%m-%d")

    user_col = db_manager.get_users_collection()
    meal_col = db_manager.get_meals_collection()
    workout_col = db_manager.get_workouts_collection()

    users_cursor = user_col.find({})
    users = await users_cursor.to_list(length=100)

    comparison_list: List[FriendComparisonItem] = []

    for idx, u in enumerate(users):
        user_id = u["id"]
        target_cals = float(u.get("target_calories", 2000.0))
        target_p = float(u.get("target_macros", {}).get("protein_g", 120.0))

        # Meals for today
        meals_cursor = meal_col.find({"user_id": user_id, "date": date})
        meals = await meals_cursor.to_list(length=100)
        consumed_cals = sum(m.get("total_calories", 0.0) for m in meals)
        consumed_p = sum(m.get("total_macros", {}).get("protein_g", 0.0) for m in meals)

        # Workouts for today
        workouts_cursor = workout_col.find({"user_id": user_id, "date": date})
        workouts = await workouts_cursor.to_list(length=100)
        cals_burned = sum(w.get("calories_burned", 0.0) for w in workouts)
        workouts_count = len(workouts)

        cal_pct = round((consumed_cals / target_cals) * 100, 1) if target_cals > 0 else 0.0
        prot_pct = round((consumed_p / target_p) * 100, 1) if target_p > 0 else 0.0

        # Badge assignment logic
        if prot_pct >= 90:
            badge = "Protein Champion 🥩"
        elif workouts_count > 0 and 80 <= cal_pct <= 105:
            badge = "Discipline Master 🎯"
        elif workouts_count > 0:
            badge = "Gym Beast 🏋️‍♂️"
        elif cal_pct > 0:
            badge = "Active Tracking 🥗"
        else:
            badge = "Fresh Start 🌱"

        # Deterministic simulated streak for demo consistency
        streak = (idx * 3 + 4) % 14 + 1

        comparison_list.append(FriendComparisonItem(
            user_id=user_id,
            name=u.get("name", "Gym Buddy"),
            gender=u.get("gender", "other"),
            weight_kg=float(u.get("weight_kg", 70.0)),
            fitness_goal=str(u.get("fitness_goal", "maintenance")),
            diet_style=str(u.get("diet_style", "balanced")),
            target_calories=target_cals,
            consumed_calories=round(consumed_cals, 1),
            calorie_progress_pct=cal_pct,
            target_protein=target_p,
            consumed_protein=round(consumed_p, 1),
            protein_progress_pct=prot_pct,
            calories_burned_today=round(cals_burned, 1),
            workouts_count_today=workouts_count,
            streak_days=streak,
            status_badge=badge
        ))

    return comparison_list

@router.get("/compare")
async def compare_two_friends(
    user1_id: str = Query(...),
    user2_id: str = Query(...),
    date: Optional[str] = None
):
    """Deep head-to-head comparison between two gym buddies."""
    if not date:
        date = datetime.utcnow().strftime("%Y-%m-%d")

    user_col = db_manager.get_users_collection()
    u1 = await user_col.find_one({"id": user1_id})
    u2 = await user_col.find_one({"id": user2_id})

    if not u1 or not u2:
        raise HTTPException(status_code=404, detail="One or both users not found")

    meal_col = db_manager.get_meals_collection()
    workout_col = db_manager.get_workouts_collection()

    async def get_user_stats(user_doc):
        uid = user_doc["id"]
        meals_cursor = meal_col.find({"user_id": uid, "date": date})
        meals = await meals_cursor.to_list(length=100)
        cals = sum(m.get("total_calories", 0.0) for m in meals)
        p = sum(m.get("total_macros", {}).get("protein_g", 0.0) for m in meals)
        c = sum(m.get("total_macros", {}).get("carbs_g", 0.0) for m in meals)
        f = sum(m.get("total_macros", {}).get("fats_g", 0.0) for m in meals)
        sugar = sum(m.get("total_micros", {}).get("sugar_g", 0.0) for m in meals)

        workouts_cursor = workout_col.find({"user_id": uid, "date": date})
        workouts = await workouts_cursor.to_list(length=100)
        burned = sum(w.get("calories_burned", 0.0) for w in workouts)

        return {
            "profile": user_doc,
            "meals_count": len(meals),
            "consumed_calories": round(cals, 1),
            "consumed_protein": round(p, 1),
            "consumed_carbs": round(c, 1),
            "consumed_fats": round(f, 1),
            "consumed_sugar": round(sugar, 1),
            "workouts_count": len(workouts),
            "calories_burned": round(burned, 1),
            "net_calories": round(cals - burned, 1)
        }

    stats1 = await get_user_stats(u1)
    stats2 = await get_user_stats(u2)

    return {
        "date": date,
        "friend_1": stats1,
        "friend_2": stats2
    }

