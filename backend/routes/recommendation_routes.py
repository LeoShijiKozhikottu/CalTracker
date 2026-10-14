from fastapi import APIRouter, HTTPException, Query
from models.schemas import RecommendationResponse, UserProfile
from services.recommendation_engine import generate_recommendations
from routes.meal_routes import get_daily_summary
from database import db_manager

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/next-meal", response_model=RecommendationResponse)
async def get_next_meal_recommendations(
    user_id: str = Query(...),
    date: str = Query(...)
):
    user_col = db_manager.get_users_collection()
    user_dict = await user_col.find_one({"id": user_id})
    if not user_dict:
        raise HTTPException(status_code=404, detail="User profile not found")

    user_profile = UserProfile(**user_dict)
    summary = await get_daily_summary(user_id=user_id, date=date)

    recommendations = generate_recommendations(user_profile, summary)
    return recommendations
