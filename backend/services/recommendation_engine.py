from typing import List
from models.schemas import (
    UserProfile,
    DailyIntakeSummary,
    MealRecommendation,
    RecommendationResponse,
    FoodItem,
    DietStyle,
    FitnessGoal
)
from services.nutrition_db import lookup_food_by_name

def generate_recommendations(
    user: UserProfile,
    summary: DailyIntakeSummary
) -> RecommendationResponse:
    rem_cals = summary.remaining_calories
    rem_p = summary.remaining_macros.protein_g
    rem_c = summary.remaining_macros.carbs_g
    rem_f = summary.remaining_macros.fats_g
    
    logged_meal_types = set()
    for m in summary.meals:
        mt = getattr(m, "meal_type", None)
        if mt is None and isinstance(m, dict):
            mt = m.get("meal_type")
        val = getattr(mt, "value", str(mt)) if mt is not None else ""
        logged_meal_types.add(str(val).lower())

    is_lunch_logged = "lunch" in logged_meal_types
    is_dinner_logged = "dinner" in logged_meal_types

    diet_val = getattr(user.diet_style, "value", str(user.diet_style)).lower()
    is_veg = diet_val in ["vegetarian", "vegan"]
    is_vegan = diet_val == "vegan"
    
    recommendations: List[MealRecommendation] = []
    
    # 1. AFTERNOON LUNCH RECOMMENDATION
    if not is_lunch_logged:
        lunch_foods: List[FoodItem] = []
        if is_veg:
            if is_vegan:
                soya = lookup_food_by_name("soya chunks curry")
                rice = lookup_food_by_name("steamed brown rice")
                sprouts = lookup_food_by_name("sprouts salad")
                if soya: lunch_foods.append(soya)
                if rice: lunch_foods.append(rice)
                if sprouts: lunch_foods.append(sprouts)
                title = "High-Protein Plant-Powered Afternoon Lunch"
                desc = "Rich in plant protein, iron, and fiber to balance morning carbohydrates and support muscle recovery."
            else:
                paneer = lookup_food_by_name("paneer bhurji")
                roti = lookup_food_by_name("whole wheat roti")
                dal = lookup_food_by_name("dal tadka")
                if paneer: lunch_foods.append(paneer)
                if roti: lunch_foods.append(roti)
                if dal: lunch_foods.append(dal)
                title = "Muscle-Building Paneer & Lentil Afternoon Feast"
                desc = "Provides over 35g of bioavailable vegetarian protein with calcium and complex carbs."
        else:
            chicken = lookup_food_by_name("grilled chicken breast")
            rice = lookup_food_by_name("steamed brown rice")
            dal = lookup_food_by_name("dal tadka")
            if chicken: lunch_foods.append(chicken)
            if rice: lunch_foods.append(rice)
            if dal: lunch_foods.append(dal)
            title = "Lean Protein & Complex Carb Afternoon Plate"
            desc = "45g+ clean protein with sustained-release complex carbs, perfect for afternoon gym energy and lean muscle synthesis."

        cals = sum(f.calories for f in lunch_foods)
        prot = sum(f.macros.protein_g for f in lunch_foods)
        carbs = sum(f.macros.carbs_g for f in lunch_foods)
        fats = sum(f.macros.fats_g for f in lunch_foods)
        
        recommendations.append(MealRecommendation(
            meal_slot="Afternoon Lunch (1:00 PM - 2:30 PM)",
            title=title,
            description=desc,
            foods=lunch_foods,
            total_calories=round(cals, 1),
            total_protein=round(prot, 1),
            total_carbs=round(carbs, 1),
            total_fats=round(fats, 1),
            key_benefits=["High Protein Recovery", "Low Sugar", "Sustained Energy"],
            dietary_match="vegetarian" if is_veg else "lean_meat"
        ))

    # 2. EVENING POST-WORKOUT / PRE-DINNER SNACK
    if rem_p > 40:
        snack_foods: List[FoodItem] = []
        if is_vegan:
            sprouts = lookup_food_by_name("sprouts salad")
            if sprouts: snack_foods.append(sprouts)
            snack_title = "Crunchy Moong Sprouts Power Snack"
            snack_desc = "Quick micro-nutrient boost with natural enzymes, vitamin C, and 10g clean protein."
        elif is_veg:
            yogurt = lookup_food_by_name("greek yogurt")
            whey = lookup_food_by_name("whey protein shake")
            if yogurt: snack_foods.append(yogurt)
            if whey: snack_foods.append(whey)
            snack_title = "Greek Yogurt & Whey Protein Boost"
            snack_desc = "Rapidly absorbed amino acids to spike muscle protein synthesis before or after your workout."
        else:
            eggs = lookup_food_by_name("egg whites")
            whey = lookup_food_by_name("whey protein shake")
            if eggs: snack_foods.append(eggs)
            if whey: snack_foods.append(whey)
            snack_title = "Egg Whites & Whey High-Protein Refuel"
            snack_desc = "Zero-fat, zero-sugar muscle building snack packing nearly 40g of pure protein."

        cals = sum(f.calories for f in snack_foods)
        prot = sum(f.macros.protein_g for f in snack_foods)
        carbs = sum(f.macros.carbs_g for f in snack_foods)
        fats = sum(f.macros.fats_g for f in snack_foods)

        recommendations.append(MealRecommendation(
            meal_slot="Evening Snack / Pre-Workout (5:00 PM)",
            title=snack_title,
            description=snack_desc,
            foods=snack_foods,
            total_calories=round(cals, 1),
            total_protein=round(prot, 1),
            total_carbs=round(carbs, 1),
            total_fats=round(fats, 1),
            key_benefits=["Fast Digestion", "Zero Added Sugar", "Low Cholesterol"],
            dietary_match="high_protein"
        ))

    # 3. NIGHT DINNER RECOMMENDATION
    if not is_dinner_logged:
        dinner_foods: List[FoodItem] = []
        if is_veg:
            dal = lookup_food_by_name("dal tadka")
            roti = lookup_food_by_name("whole wheat roti")
            sprouts = lookup_food_by_name("sprouts salad")
            if dal: dinner_foods.append(dal)
            if roti: dinner_foods.append(roti)
            if sprouts: dinner_foods.append(sprouts)
            dinner_title = "Light Digestive Vegetarian Dinner"
            dinner_desc = "Easily digestible lentils and whole wheat with live sprouts. Kept light to promote deep sleep and recovery."
        else:
            salmon = lookup_food_by_name("grilled salmon")
            eggs = lookup_food_by_name("egg whites")
            if salmon: dinner_foods.append(salmon)
            if eggs: dinner_foods.append(eggs)
            dinner_title = "Omega-3 Salmon & Egg White Lean Dinner"
            dinner_desc = "Rich in Vitamin D, B12, and healthy Omega-3 fatty acids for joint mobility and overnight muscular repair."

        cals = sum(f.calories for f in dinner_foods)
        prot = sum(f.macros.protein_g for f in dinner_foods)
        carbs = sum(f.macros.carbs_g for f in dinner_foods)
        fats = sum(f.macros.fats_g for f in dinner_foods)

        recommendations.append(MealRecommendation(
            meal_slot="Night Dinner (8:00 PM - 9:30 PM)",
            title=dinner_title,
            description=dinner_desc,
            foods=dinner_foods,
            total_calories=round(cals, 1),
            total_protein=round(prot, 1),
            total_carbs=round(carbs, 1),
            total_fats=round(fats, 1),
            key_benefits=["Overnight Recovery", "Heart-Healthy", "Low Glycemic Index"],
            dietary_match="vegetarian" if is_veg else "seafood_lean"
        ))

    # Contextual Nutritionist Tip
    tip = ""
    goal_val = getattr(user.fitness_goal, "value", str(user.fitness_goal)).lower()
    if goal_val == "bulking":
        tip = f"You are on a Bulking Diet ({user.target_calories} kcal target). You still have {rem_cals} kcal and {rem_p}g protein to consume today. Make sure your afternoon and dinner include dense protein and healthy carbs."
    elif goal_val == "cutting":
        tip = f"You are on a Cutting Diet ({user.target_calories} kcal limit). Keep carbohydrate portions moderate in the afternoon and prioritize high protein ({rem_p}g left) to prevent muscle breakdown."
    else:
        tip = f"Maintenance Diet active. You have {rem_cals} kcal remaining today. Balance your afternoon lunch and dinner with clean whole foods."

    gap_data = {
        "calories_remaining": rem_cals,
        "protein_g_remaining": rem_p,
        "carbs_g_remaining": rem_c,
        "fats_g_remaining": rem_f,
        "sugar_allowance_g": summary.remaining_micros.sugar_g,
        "cholesterol_allowance_mg": summary.remaining_micros.cholesterol_mg
    }

    return RecommendationResponse(
        user_id=user.id,
        date=summary.date,
        current_gap=gap_data,
        recommendations=recommendations,
        nutritionist_tip=tip
    )
