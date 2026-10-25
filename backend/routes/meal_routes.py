import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, HTTPException, Query
from models.schemas import (
    MealLog,
    MealLogCreate,
    DailyIntakeSummary,
    MacroNutrients,
    MicroNutrients
)
from database import db_manager

router = APIRouter(prefix="/meals", tags=["Meals"])

@router.post("", response_model=MealLog)
async def log_meal(meal_in: MealLogCreate):
    user_col = db_manager.get_users_collection()
    user = await user_col.find_one({"id": meal_in.user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User profile not found")

    tot_cals = sum(item.calories for item in meal_in.items)
    tot_p = sum(item.macros.protein_g for item in meal_in.items)
    tot_c = sum(item.macros.carbs_g for item in meal_in.items)
    tot_f = sum(item.macros.fats_g for item in meal_in.items)

    tot_sugar = sum(item.micros.sugar_g for item in meal_in.items)
    tot_chol = sum(item.micros.cholesterol_mg for item in meal_in.items)
    tot_sod = sum(item.micros.sodium_mg for item in meal_in.items)
    tot_fib = sum(item.micros.fiber_g for item in meal_in.items)
    tot_va = sum(item.micros.vitamin_a_mcg for item in meal_in.items)
    tot_vc = sum(item.micros.vitamin_c_mg for item in meal_in.items)
    tot_vd = sum(item.micros.vitamin_d_iu for item in meal_in.items)
    tot_vb12 = sum(item.micros.vitamin_b12_mcg for item in meal_in.items)
    tot_iron = sum(item.micros.iron_mg for item in meal_in.items)
    tot_calc = sum(item.micros.calcium_mg for item in meal_in.items)
    tot_pot = sum(item.micros.potassium_mg for item in meal_in.items)

    meal_id = str(uuid.uuid4())
    meal_doc = {
        "id": meal_id,
        "user_id": meal_in.user_id,
        "meal_type": meal_in.meal_type.value,
        "date": meal_in.date,
        "items": [item.model_dump() for item in meal_in.items],
        "total_calories": round(tot_cals, 1),
        "total_macros": {
            "protein_g": round(tot_p, 1),
            "carbs_g": round(tot_c, 1),
            "fats_g": round(tot_f, 1)
        },
        "total_micros": {
            "sugar_g": round(tot_sugar, 1),
            "cholesterol_mg": round(tot_chol, 1),
            "sodium_mg": round(tot_sod, 1),
            "fiber_g": round(tot_fib, 1),
            "vitamin_a_mcg": round(tot_va, 1),
            "vitamin_c_mg": round(tot_vc, 1),
            "vitamin_d_iu": round(tot_vd, 1),
            "vitamin_b12_mcg": round(tot_vb12, 1),
            "iron_mg": round(tot_iron, 1),
            "calcium_mg": round(tot_calc, 1),
            "potassium_mg": round(tot_pot, 1)
        },
        "notes": meal_in.notes,
        "image_url": meal_in.image_url,
        "created_at": datetime.utcnow().isoformat()
    }

    meal_col = db_manager.get_meals_collection()
    await meal_col.insert_one(meal_doc)
    return meal_doc

@router.get("/daily-summary", response_model=DailyIntakeSummary)
async def get_daily_summary(
    user_id: str = Query(...),
    date: str = Query(...)
):
    user_col = db_manager.get_users_collection()
    user_data = await user_col.find_one({"id": user_id})
    if not user_data:
        raise HTTPException(status_code=404, detail="User profile not found")

    target_cals = float(user_data.get("target_calories", 2000.0))
    target_macros = MacroNutrients(**user_data.get("target_macros", {}))
    target_micros = MicroNutrients(**user_data.get("target_micros", {}))

    meal_col = db_manager.get_meals_collection()
    cursor = meal_col.find({"user_id": user_id, "date": date})
    meals_raw = await cursor.to_list(length=100)

    consumed_cals = sum(m.get("total_calories", 0) for m in meals_raw)
    consumed_p = sum(m.get("total_macros", {}).get("protein_g", 0) for m in meals_raw)
    consumed_c = sum(m.get("total_macros", {}).get("carbs_g", 0) for m in meals_raw)
    consumed_f = sum(m.get("total_macros", {}).get("fats_g", 0) for m in meals_raw)

    consumed_sugar = sum(m.get("total_micros", {}).get("sugar_g", 0) for m in meals_raw)
    consumed_chol = sum(m.get("total_micros", {}).get("cholesterol_mg", 0) for m in meals_raw)
    consumed_sod = sum(m.get("total_micros", {}).get("sodium_mg", 0) for m in meals_raw)
    consumed_fib = sum(m.get("total_micros", {}).get("fiber_g", 0) for m in meals_raw)
    consumed_va = sum(m.get("total_micros", {}).get("vitamin_a_mcg", 0) for m in meals_raw)
    consumed_vc = sum(m.get("total_micros", {}).get("vitamin_c_mg", 0) for m in meals_raw)
    consumed_vd = sum(m.get("total_micros", {}).get("vitamin_d_iu", 0) for m in meals_raw)
    consumed_vb12 = sum(m.get("total_micros", {}).get("vitamin_b12_mcg", 0) for m in meals_raw)
    consumed_iron = sum(m.get("total_micros", {}).get("iron_mg", 0) for m in meals_raw)
    consumed_calc = sum(m.get("total_micros", {}).get("calcium_mg", 0) for m in meals_raw)
    consumed_pot = sum(m.get("total_micros", {}).get("potassium_mg", 0) for m in meals_raw)

    consumed_macros = MacroNutrients(
        protein_g=round(consumed_p, 1),
        carbs_g=round(consumed_c, 1),
        fats_g=round(consumed_f, 1)
    )

    consumed_micros = MicroNutrients(
        sugar_g=round(consumed_sugar, 1),
        cholesterol_mg=round(consumed_chol, 1),
        sodium_mg=round(consumed_sod, 1),
        fiber_g=round(consumed_fib, 1),
        vitamin_a_mcg=round(consumed_va, 1),
        vitamin_c_mg=round(consumed_vc, 1),
        vitamin_d_iu=round(consumed_vd, 1),
        vitamin_b12_mcg=round(consumed_vb12, 1),
        iron_mg=round(consumed_iron, 1),
        calcium_mg=round(consumed_calc, 1),
        potassium_mg=round(consumed_pot, 1)
    )

    remaining_cals = max(round(target_cals - consumed_cals, 1), 0.0)
    remaining_macros = MacroNutrients(
        protein_g=max(round(target_macros.protein_g - consumed_p, 1), 0.0),
        carbs_g=max(round(target_macros.carbs_g - consumed_c, 1), 0.0),
        fats_g=max(round(target_macros.fats_g - consumed_f, 1), 0.0)
    )

    remaining_micros = MicroNutrients(
        sugar_g=max(round(target_micros.sugar_g - consumed_sugar, 1), 0.0),
        cholesterol_mg=max(round(target_micros.cholesterol_mg - consumed_chol, 1), 0.0),
        sodium_mg=max(round(target_micros.sodium_mg - consumed_sod, 1), 0.0),
        fiber_g=max(round(target_micros.fiber_g - consumed_fib, 1), 0.0),
        vitamin_a_mcg=max(round(target_micros.vitamin_a_mcg - consumed_va, 1), 0.0),
        vitamin_c_mg=max(round(target_micros.vitamin_c_mg - consumed_vc, 1), 0.0),
        vitamin_d_iu=max(round(target_micros.vitamin_d_iu - consumed_vd, 1), 0.0),
        vitamin_b12_mcg=max(round(target_micros.vitamin_b12_mcg - consumed_vb12, 1), 0.0),
        iron_mg=max(round(target_micros.iron_mg - consumed_iron, 1), 0.0),
        calcium_mg=max(round(target_micros.calcium_mg - consumed_calc, 1), 0.0),
        potassium_mg=max(round(target_micros.potassium_mg - consumed_pot, 1), 0.0)
    )

    cal_pct = round((consumed_cals / target_cals) * 100, 1) if target_cals > 0 else 0.0
    prot_pct = round((consumed_p / target_macros.protein_g) * 100, 1) if target_macros.protein_g > 0 else 0.0

    workout_col = db_manager.get_workouts_collection()
    workouts_cursor = workout_col.find({"user_id": user_id, "date": date})
    workouts_raw = await workouts_cursor.to_list(length=100)
    cals_burned = sum(w.get("calories_burned", 0.0) for w in workouts_raw)

    return DailyIntakeSummary(
        user_id=user_id,
        date=date,
        target_calories=target_cals,
        consumed_calories=round(consumed_cals, 1),
        remaining_calories=remaining_cals,
        target_macros=target_macros,
        consumed_macros=consumed_macros,
        remaining_macros=remaining_macros,
        target_micros=target_micros,
        consumed_micros=consumed_micros,
        remaining_micros=remaining_micros,
        meals=meals_raw,
        calorie_progress_pct=cal_pct,
        protein_progress_pct=prot_pct,
        calories_burned=round(cals_burned, 1),
        net_calories=round(consumed_cals - cals_burned, 1)
    )

@router.delete("/{meal_id}")
async def delete_meal(meal_id: str):
    meal_col = db_manager.get_meals_collection()
    res = await meal_col.delete_one({"id": meal_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Meal not found")
    return {"message": "Meal deleted successfully"}
