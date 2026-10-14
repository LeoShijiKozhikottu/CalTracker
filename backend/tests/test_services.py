import pytest
from backend.services.diet_calculator import calculate_bmr, calculate_tdee, calculate_targets
from backend.models.schemas import FitnessGoal, ActivityLevel, DietStyle, UserProfile, DailyIntakeSummary, MacroNutrients, MicroNutrients, MealLog, MealType, FoodItem
from backend.services.nutrition_db import lookup_food_by_name, NUTRITION_DATABASE
from backend.services.gemini_service import get_default_analyzed_food
from backend.services.recommendation_engine import generate_recommendations

def test_bmr_calculation():
    # Male: 70kg, 175cm, 25yo -> 10*70 + 6.25*175 - 5*25 + 5 = 700 + 1093.75 - 125 + 5 = 1673.75 -> 1673.8
    bmr = calculate_bmr(70.0, 175.0, 25, "male")
    assert bmr == 1673.8

def test_targets_bulking_vs_cutting():
    # Bulking
    bulk_targets = calculate_targets(
        weight_kg=75.0,
        height_cm=180.0,
        age=24,
        gender="male",
        activity_level=ActivityLevel.VERY_ACTIVE,
        fitness_goal=FitnessGoal.BULKING,
        diet_style=DietStyle.HIGH_PROTEIN
    )
    # Cutting
    cut_targets = calculate_targets(
        weight_kg=75.0,
        height_cm=180.0,
        age=24,
        gender="male",
        activity_level=ActivityLevel.VERY_ACTIVE,
        fitness_goal=FitnessGoal.CUTTING,
        diet_style=DietStyle.HIGH_PROTEIN
    )
    # Bulking calories should be significantly higher than cutting calories
    assert bulk_targets["target_calories"] > cut_targets["target_calories"]
    assert bulk_targets["target_macros"].protein_g > 100

def test_nutrition_db_lookup():
    dosa = lookup_food_by_name("plain dosa")
    assert dosa is not None
    assert dosa.calories > 100
    assert dosa.macros.carbs_g > 20

    sambar = lookup_food_by_name("sambar")
    assert sambar is not None
    assert sambar.macros.protein_g > 3

def test_default_analyzed_food():
    items, insight = get_default_analyzed_food()
    assert len(items) >= 2
    item_names = [i.name.lower() for i in items]
    assert any("dosa" in n for n in item_names)
    assert any("sambar" in n for n in item_names)
    assert len(insight) > 20

def test_biriyani_analyzed_food():
    # Test both 'biriyani' and 'biryani' spelling
    for hint in ["biriyani", "Chicken Biryani"]:
        items, insight = get_default_analyzed_food(custom_dish_hint=hint)
        assert len(items) >= 2
        item_names = [i.name.lower() for i in items]
        assert any("biryani" in n for n in item_names)
        assert any("raita" in n for n in item_names)
        tot_protein = sum(i.macros.protein_g for i in items)
        assert tot_protein >= 35.0  # high protein meal
        assert "protein" in insight.lower()

def test_apple_analyzed_food():
    # Test Apple detection
    items, insight = get_default_analyzed_food(custom_dish_hint="apple")
    assert len(items) == 1
    assert "apple" in items[0].name.lower()
    assert items[0].calories == 95.0
    assert items[0].micros.fiber_g >= 4.0
    assert "fruit" in insight.lower() or "pectin" in insight.lower()

def test_chappathi_and_chicken_curry():
    # Test user's exact phrase: "Chappathi and Chicken Curry"
    for phrase in ["Chappathi and Chicken Curry", "Chapati with chicken curry", "roti and chicken gravy"]:
        items, insight = get_default_analyzed_food(custom_dish_hint=phrase)
        item_names = [i.name.lower() for i in items]
        assert any("roti" in n or "chapati" in n for n in item_names)
        assert any("curry" in n for n in item_names)
        tot_protein = sum(i.macros.protein_g for i in items)
        assert tot_protein >= 30.0  # high protein gym meal
        assert "protein" in insight.lower()

def test_apple_visual_detection_without_hint():
    from PIL import Image
    import io
    # Create red image resembling an apple
    img = Image.new("RGB", (100, 100), color=(220, 20, 20))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()
    
    items, insight = get_default_analyzed_food(custom_dish_hint=None, image_bytes=image_bytes)
    assert len(items) == 1
    assert "apple" in items[0].name.lower()

def test_recommendation_engine():
    user = UserProfile(
        id="test-user-1",
        name="Test Rahul",
        age=24,
        gender="male",
        height_cm=178.0,
        weight_kg=72.0,
        activity_level=ActivityLevel.VERY_ACTIVE,
        fitness_goal=FitnessGoal.BULKING,
        diet_style=DietStyle.HIGH_PROTEIN,
        bmr=1700.0,
        tdee=2600.0,
        target_calories=3000.0,
        target_macros=MacroNutrients(protein_g=150.0, carbs_g=400.0, fats_g=70.0),
        target_micros=MicroNutrients(sugar_g=40.0, cholesterol_mg=300.0, sodium_mg=2300.0, fiber_g=35.0)
    )

    # Simulate having eaten only Breakfast (Dosa + Sambar)
    breakfast_meal = MealLog(
        id="meal-1",
        user_id="test-user-1",
        meal_type=MealType.BREAKFAST,
        date="2026-10-06",
        items=[
            FoodItem(
                name="2 Crispy Plain Dosas",
                portion="2 dosas",
                calories=336.0,
                macros=MacroNutrients(protein_g=7.8, carbs_g=58.0, fats_g=7.4),
                micros=MicroNutrients()
            ),
            FoodItem(
                name="Vegetable Sambar",
                portion="1 bowl",
                calories=95.0,
                macros=MacroNutrients(protein_g=4.5, carbs_g=14.5, fats_g=2.2),
                micros=MicroNutrients()
            )
        ],
        total_calories=431.0,
        total_macros=MacroNutrients(protein_g=12.3, carbs_g=72.5, fats_g=9.6),
        total_micros=MicroNutrients()
    )

    summary = DailyIntakeSummary(
        user_id="test-user-1",
        date="2026-10-06",
        target_calories=3000.0,
        consumed_calories=431.0,
        remaining_calories=2569.0,
        target_macros=MacroNutrients(protein_g=150.0, carbs_g=400.0, fats_g=70.0),
        consumed_macros=MacroNutrients(protein_g=12.3, carbs_g=72.5, fats_g=9.6),
        remaining_macros=MacroNutrients(protein_g=137.7, carbs_g=327.5, fats_g=60.4),
        target_micros=MicroNutrients(sugar_g=40.0, cholesterol_mg=300.0),
        consumed_micros=MicroNutrients(),
        remaining_micros=MicroNutrients(sugar_g=40.0, cholesterol_mg=300.0),
        meals=[breakfast_meal],
        calorie_progress_pct=14.4,
        protein_progress_pct=8.2
    )

    rec_res = generate_recommendations(user, summary)
    assert len(rec_res.recommendations) > 0
    # Must recommend Afternoon Lunch and Dinner
    slots = [r.meal_slot for r in rec_res.recommendations]
    assert any("Afternoon Lunch" in s for s in slots)
    assert any("Dinner" in s for s in slots)
