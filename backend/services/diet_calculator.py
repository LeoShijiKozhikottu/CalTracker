from models.schemas import (
    FitnessGoal,
    ActivityLevel,
    DietStyle,
    MacroNutrients,
    MicroNutrients
)

ACTIVITY_MULTIPLIERS = {
    ActivityLevel.SEDENTARY: 1.2,
    ActivityLevel.LIGHTLY_ACTIVE: 1.375,
    ActivityLevel.MODERATELY_ACTIVE: 1.55,
    ActivityLevel.VERY_ACTIVE: 1.725,
    ActivityLevel.EXTRA_ACTIVE: 1.9,
}

def calculate_bmr(weight_kg: float, height_cm: float, age: int, gender: str) -> float:
    if gender.lower() == "female":
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161
    else:
        bmr = (10 * weight_kg) + (6.25 * height_cm) - (5 * age) + 5
    return round(max(bmr, 800.0), 1)

def calculate_tdee(bmr: float, activity_level: ActivityLevel) -> float:
    multiplier = ACTIVITY_MULTIPLIERS.get(activity_level, 1.55)
    return round(bmr * multiplier, 1)

def calculate_targets(
    weight_kg: float,
    height_cm: float,
    age: int,
    gender: str,
    activity_level: ActivityLevel,
    fitness_goal: FitnessGoal,
    diet_style: DietStyle,
    custom_calories: float = None,
    custom_protein: float = None
) -> dict:
    bmr = calculate_bmr(weight_kg, height_cm, age, gender)
    tdee = calculate_tdee(bmr, activity_level)

    if custom_calories and custom_calories > 500:
        target_calories = custom_calories
    else:
        if fitness_goal == FitnessGoal.BULKING:
            target_calories = tdee + 400.0
        elif fitness_goal == FitnessGoal.CUTTING:
            target_calories = max(tdee - 450.0, 1200.0)
        elif fitness_goal == FitnessGoal.OVERWEIGHT_LOSS:
            target_calories = max(tdee - 550.0, 1300.0)
        elif fitness_goal == FitnessGoal.RECOMPOSITION:
            target_calories = tdee - 100.0
        elif fitness_goal == FitnessGoal.ATHLETIC_PERFORMANCE:
            target_calories = tdee + 200.0
        else:
            target_calories = tdee

    target_calories = round(target_calories, 0)

    if custom_protein and custom_protein > 20:
        protein_g = custom_protein
    else:
        if fitness_goal in [FitnessGoal.CUTTING, FitnessGoal.RECOMPOSITION]:
            protein_g = weight_kg * 2.2
        elif fitness_goal == FitnessGoal.BULKING:
            protein_g = weight_kg * 2.0
        elif fitness_goal == FitnessGoal.OVERWEIGHT_LOSS:
            protein_g = max(weight_kg * 1.6, 110.0)
        else:
            protein_g = weight_kg * 1.8

    if diet_style == DietStyle.KETO:
        protein_cals = protein_g * 4
        carbs_g = round(max((target_calories * 0.05) / 4, 20.0), 1)
        remaining_cals = max(target_calories - protein_cals - (carbs_g * 4), 200)
        fats_g = round(remaining_cals / 9, 1)
    elif diet_style == DietStyle.LOW_CARB:
        fats_g = round(weight_kg * 1.0, 1)
        protein_cals = protein_g * 4
        fats_cals = fats_g * 9
        carbs_cals = max(target_calories - protein_cals - fats_cals, 200)
        carbs_g = round(carbs_cals / 4, 1)
    else:
        fats_g = round(weight_kg * 0.9, 1)
        fats_cals = fats_g * 9
        protein_cals = protein_g * 4
        carbs_cals = max(target_calories - protein_cals - fats_cals, 200)
        carbs_g = round(carbs_cals / 4, 1)

    protein_g = round(protein_g, 1)

    target_macros = MacroNutrients(
        protein_g=protein_g,
        carbs_g=carbs_g,
        fats_g=fats_g
    )

    target_micros = MicroNutrients(
        sugar_g=40.0,
        cholesterol_mg=300.0,
        sodium_mg=2300.0,
        fiber_g=35.0 if gender.lower() == "male" else 28.0,
        vitamin_a_mcg=900.0,
        vitamin_c_mg=90.0,
        vitamin_d_iu=800.0,
        vitamin_b12_mcg=2.4,
        iron_mg=14.0 if gender.lower() == "male" else 18.0,
        calcium_mg=1000.0,
        potassium_mg=3400.0
    )

    return {
        "bmr": bmr,
        "tdee": tdee,
        "target_calories": target_calories,
        "target_macros": target_macros,
        "target_micros": target_micros
    }
