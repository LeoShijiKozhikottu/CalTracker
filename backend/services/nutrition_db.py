from typing import Dict, List, Optional
from models.schemas import FoodItem, MacroNutrients, MicroNutrients

NUTRITION_DATABASE: Dict[str, Dict] = {
    # South Indian & Traditional Staples
    "plain dosa": {
        "name": "Plain Dosa",
        "portion": "1 medium dosa (80g)",
        "calories": 168.0,
        "macros": {"protein_g": 3.9, "carbs_g": 29.0, "fats_g": 3.7},
        "micros": {
            "sugar_g": 0.5, "cholesterol_mg": 0.0, "sodium_mg": 180.0, "fiber_g": 1.4,
            "vitamin_a_mcg": 5.0, "vitamin_c_mg": 0.2, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 0.9, "calcium_mg": 16.0, "potassium_mg": 70.0
        },
        "category": "breakfast",
        "diet": "vegetarian"
    },
    "masala dosa": {
        "name": "Masala Dosa",
        "portion": "1 medium dosa with potato filling (150g)",
        "calories": 285.0,
        "macros": {"protein_g": 5.5, "carbs_g": 42.0, "fats_g": 10.5},
        "micros": {
            "sugar_g": 2.0, "cholesterol_mg": 0.0, "sodium_mg": 380.0, "fiber_g": 3.2,
            "vitamin_a_mcg": 15.0, "vitamin_c_mg": 12.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.8, "calcium_mg": 28.0, "potassium_mg": 290.0
        },
        "category": "breakfast",
        "diet": "vegetarian"
    },
    "sambar": {
        "name": "Vegetable Sambar",
        "portion": "1 medium bowl (150ml)",
        "calories": 95.0,
        "macros": {"protein_g": 4.5, "carbs_g": 14.5, "fats_g": 2.2},
        "micros": {
            "sugar_g": 3.5, "cholesterol_mg": 0.0, "sodium_mg": 410.0, "fiber_g": 3.8,
            "vitamin_a_mcg": 120.0, "vitamin_c_mg": 14.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.7, "calcium_mg": 45.0, "potassium_mg": 260.0
        },
        "category": "curry",
        "diet": "vegan"
    },
    "coconut chutney": {
        "name": "Coconut Chutney",
        "portion": "2 tbsp (30g)",
        "calories": 65.0,
        "macros": {"protein_g": 0.9, "carbs_g": 2.4, "fats_g": 5.8},
        "micros": {
            "sugar_g": 0.8, "cholesterol_mg": 0.0, "sodium_mg": 120.0, "fiber_g": 1.5,
            "vitamin_a_mcg": 2.0, "vitamin_c_mg": 1.5, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 0.6, "calcium_mg": 8.0, "potassium_mg": 95.0
        },
        "category": "condiment",
        "diet": "vegan"
    },
    "idli": {
        "name": "Steamed Idli",
        "portion": "2 pieces (100g)",
        "calories": 130.0,
        "macros": {"protein_g": 4.0, "carbs_g": 26.0, "fats_g": 0.5},
        "micros": {
            "sugar_g": 0.4, "cholesterol_mg": 0.0, "sodium_mg": 190.0, "fiber_g": 1.6,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 0.8, "calcium_mg": 18.0, "potassium_mg": 65.0
        },
        "category": "breakfast",
        "diet": "vegan"
    },
    "upma": {
        "name": "Vegetable Rava Upma",
        "portion": "1 cup (150g)",
        "calories": 210.0,
        "macros": {"protein_g": 5.0, "carbs_g": 34.0, "fats_g": 6.0},
        "micros": {
            "sugar_g": 1.8, "cholesterol_mg": 0.0, "sodium_mg": 280.0, "fiber_g": 2.5,
            "vitamin_a_mcg": 45.0, "vitamin_c_mg": 6.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.2, "calcium_mg": 24.0, "potassium_mg": 140.0
        },
        "category": "breakfast",
        "diet": "vegetarian"
    },

    # Lunch / Afternoon Muscle & Lean Staples
    "chicken biryani": {
        "name": "Dum Chicken Biryani",
        "portion": "1 full plate (350g, 2 chicken pieces)",
        "calories": 560.0,
        "macros": {"protein_g": 34.5, "carbs_g": 66.0, "fats_g": 17.5},
        "micros": {
            "sugar_g": 2.0, "cholesterol_mg": 85.0, "sodium_mg": 620.0, "fiber_g": 3.5,
            "vitamin_a_mcg": 70.0, "vitamin_c_mg": 8.5, "vitamin_d_iu": 14.0, "vitamin_b12_mcg": 0.8,
            "iron_mg": 2.8, "calcium_mg": 48.0, "potassium_mg": 430.0
        },
        "category": "lunch_main",
        "diet": "non-veg"
    },
    "vegetable biryani": {
        "name": "Vegetable Biryani",
        "portion": "1 plate (350g with vegetables & paneer)",
        "calories": 480.0,
        "macros": {"protein_g": 14.0, "carbs_g": 74.0, "fats_g": 14.0},
        "micros": {
            "sugar_g": 3.0, "cholesterol_mg": 15.0, "sodium_mg": 560.0, "fiber_g": 5.5,
            "vitamin_a_mcg": 110.0, "vitamin_c_mg": 16.0, "vitamin_d_iu": 4.0, "vitamin_b12_mcg": 0.3,
            "iron_mg": 3.2, "calcium_mg": 110.0, "potassium_mg": 390.0
        },
        "category": "lunch_main",
        "diet": "vegetarian"
    },
    "onion raita": {
        "name": "Cucumber & Onion Curd Raita",
        "portion": "1 small bowl (120g)",
        "calories": 75.0,
        "macros": {"protein_g": 4.2, "carbs_g": 5.0, "fats_g": 4.1},
        "micros": {
            "sugar_g": 3.8, "cholesterol_mg": 10.0, "sodium_mg": 140.0, "fiber_g": 0.8,
            "vitamin_a_mcg": 32.0, "vitamin_c_mg": 4.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.5,
            "iron_mg": 0.3, "calcium_mg": 140.0, "potassium_mg": 190.0
        },
        "category": "condiment",
        "diet": "vegetarian"
    },
    "grilled chicken breast": {
        "name": "Grilled Chicken Breast",
        "portion": "150g cooked",
        "calories": 248.0,
        "macros": {"protein_g": 46.5, "carbs_g": 0.0, "fats_g": 5.4},
        "micros": {
            "sugar_g": 0.0, "cholesterol_mg": 125.0, "sodium_mg": 110.0, "fiber_g": 0.0,
            "vitamin_a_mcg": 18.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 6.0, "vitamin_b12_mcg": 0.6,
            "iron_mg": 1.6, "calcium_mg": 22.0, "potassium_mg": 380.0
        },
        "category": "protein_main",
        "diet": "non-veg"
    },
    "chicken curry": {
        "name": "Homestyle Chicken Curry",
        "portion": "1 medium bowl (200g with gravy & chicken)",
        "calories": 265.0,
        "macros": {"protein_g": 28.5, "carbs_g": 7.5, "fats_g": 13.5},
        "micros": {
            "sugar_g": 1.5, "cholesterol_mg": 78.0, "sodium_mg": 480.0, "fiber_g": 2.1,
            "vitamin_a_mcg": 45.0, "vitamin_c_mg": 6.5, "vitamin_d_iu": 8.0, "vitamin_b12_mcg": 0.6,
            "iron_mg": 2.2, "calcium_mg": 32.0, "potassium_mg": 380.0
        },
        "category": "curry",
        "diet": "non-veg"
    },
    "paneer bhurji": {
        "name": "Spiced Paneer Bhurji",
        "portion": "150g",
        "calories": 290.0,
        "macros": {"protein_g": 22.0, "carbs_g": 6.5, "fats_g": 19.5},
        "micros": {
            "sugar_g": 2.5, "cholesterol_mg": 52.0, "sodium_mg": 340.0, "fiber_g": 1.8,
            "vitamin_a_mcg": 180.0, "vitamin_c_mg": 12.0, "vitamin_d_iu": 15.0, "vitamin_b12_mcg": 1.1,
            "iron_mg": 1.4, "calcium_mg": 410.0, "potassium_mg": 190.0
        },
        "category": "protein_main",
        "diet": "vegetarian"
    },
    "dal tadka": {
        "name": "Yellow Dal Tadka",
        "portion": "1 bowl (180g)",
        "calories": 165.0,
        "macros": {"protein_g": 9.2, "carbs_g": 23.0, "fats_g": 4.5},
        "micros": {
            "sugar_g": 1.2, "cholesterol_mg": 0.0, "sodium_mg": 320.0, "fiber_g": 6.2,
            "vitamin_a_mcg": 35.0, "vitamin_c_mg": 5.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 2.6, "calcium_mg": 38.0, "potassium_mg": 320.0
        },
        "category": "curry",
        "diet": "vegan"
    },
    "steamed brown rice": {
        "name": "Steamed Brown Rice",
        "portion": "1 cup (150g)",
        "calories": 165.0,
        "macros": {"protein_g": 3.8, "carbs_g": 35.0, "fats_g": 1.3},
        "micros": {
            "sugar_g": 0.3, "cholesterol_mg": 0.0, "sodium_mg": 5.0, "fiber_g": 2.8,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.1, "calcium_mg": 14.0, "potassium_mg": 125.0
        },
        "category": "grains",
        "diet": "vegan"
    },
    "steamed white rice": {
        "name": "Steamed White Basmati Rice",
        "portion": "1 cup (150g)",
        "calories": 195.0,
        "macros": {"protein_g": 4.0, "carbs_g": 43.0, "fats_g": 0.5},
        "micros": {
            "sugar_g": 0.1, "cholesterol_mg": 0.0, "sodium_mg": 3.0, "fiber_g": 0.6,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.5, "calcium_mg": 15.0, "potassium_mg": 55.0
        },
        "category": "grains",
        "diet": "vegan"
    },
    "whole wheat roti": {
        "name": "Whole Wheat Roti / Chapati",
        "portion": "2 medium rotis (60g)",
        "calories": 140.0,
        "macros": {"protein_g": 5.2, "carbs_g": 27.5, "fats_g": 1.8},
        "micros": {
            "sugar_g": 0.6, "cholesterol_mg": 0.0, "sodium_mg": 110.0, "fiber_g": 4.2,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 1.8, "calcium_mg": 20.0, "potassium_mg": 140.0
        },
        "category": "grains",
        "diet": "vegan"
    },
    "soya chunks curry": {
        "name": "High-Protein Soya Chunks Curry",
        "portion": "1 cup (150g)",
        "calories": 210.0,
        "macros": {"protein_g": 26.0, "carbs_g": 14.0, "fats_g": 5.0},
        "micros": {
            "sugar_g": 2.0, "cholesterol_mg": 0.0, "sodium_mg": 350.0, "fiber_g": 7.0,
            "vitamin_a_mcg": 40.0, "vitamin_c_mg": 8.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 5.2, "calcium_mg": 160.0, "potassium_mg": 480.0
        },
        "category": "protein_main",
        "diet": "vegan"
    },
    "boiled eggs": {
        "name": "Whole Boiled Eggs",
        "portion": "2 whole large eggs (100g)",
        "calories": 144.0,
        "macros": {"protein_g": 12.6, "carbs_g": 1.1, "fats_g": 9.9},
        "micros": {
            "sugar_g": 1.1, "cholesterol_mg": 372.0, "sodium_mg": 142.0, "fiber_g": 0.0,
            "vitamin_a_mcg": 160.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 88.0, "vitamin_b12_mcg": 1.1,
            "iron_mg": 1.8, "calcium_mg": 56.0, "potassium_mg": 138.0
        },
        "category": "protein_main",
        "diet": "non-veg"
    },
    "egg whites": {
        "name": "Boiled Egg Whites",
        "portion": "4 large egg whites (132g)",
        "calories": 68.0,
        "macros": {"protein_g": 14.4, "carbs_g": 0.9, "fats_g": 0.2},
        "micros": {
            "sugar_g": 0.9, "cholesterol_mg": 0.0, "sodium_mg": 218.0, "fiber_g": 0.0,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.1,
            "iron_mg": 0.1, "calcium_mg": 9.0, "potassium_mg": 215.0
        },
        "category": "protein_main",
        "diet": "non-veg"
    },
    "whey protein shake": {
        "name": "Whey Protein Shake (in Water)",
        "portion": "1 scoop (32g powder + water)",
        "calories": 125.0,
        "macros": {"protein_g": 25.0, "carbs_g": 2.5, "fats_g": 1.5},
        "micros": {
            "sugar_g": 1.2, "cholesterol_mg": 45.0, "sodium_mg": 130.0, "fiber_g": 0.5,
            "vitamin_a_mcg": 0.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.8,
            "iron_mg": 0.5, "calcium_mg": 140.0, "potassium_mg": 170.0
        },
        "category": "snack",
        "diet": "vegetarian"
    },
    "greek yogurt": {
        "name": "Low-Fat Greek Yogurt",
        "portion": "1 cup (170g)",
        "calories": 130.0,
        "macros": {"protein_g": 17.0, "carbs_g": 6.0, "fats_g": 3.5},
        "micros": {
            "sugar_g": 5.0, "cholesterol_mg": 15.0, "sodium_mg": 65.0, "fiber_g": 0.0,
            "vitamin_a_mcg": 40.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 1.0,
            "iron_mg": 0.1, "calcium_mg": 200.0, "potassium_mg": 240.0
        },
        "category": "snack",
        "diet": "vegetarian"
    },
    "sprouts salad": {
        "name": "Moong Sprouts Salad with Veggies",
        "portion": "1 medium bowl (150g)",
        "calories": 125.0,
        "macros": {"protein_g": 9.5, "carbs_g": 21.0, "fats_g": 1.0},
        "micros": {
            "sugar_g": 3.8, "cholesterol_mg": 0.0, "sodium_mg": 85.0, "fiber_g": 6.5,
            "vitamin_a_mcg": 85.0, "vitamin_c_mg": 24.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 2.8, "calcium_mg": 48.0, "potassium_mg": 380.0
        },
        "category": "snack",
        "diet": "vegan"
    },
    "grilled salmon": {
        "name": "Grilled Fish / Salmon Fillet",
        "portion": "150g fillet",
        "calories": 280.0,
        "macros": {"protein_g": 34.0, "carbs_g": 0.0, "fats_g": 15.0},
        "micros": {
            "sugar_g": 0.0, "cholesterol_mg": 85.0, "sodium_mg": 95.0, "fiber_g": 0.0,
            "vitamin_a_mcg": 55.0, "vitamin_c_mg": 0.0, "vitamin_d_iu": 620.0, "vitamin_b12_mcg": 4.2,
            "iron_mg": 1.1, "calcium_mg": 20.0, "potassium_mg": 530.0
        },
        "category": "protein_main",
        "diet": "non-veg"
    },
    "oatmeal with milk": {
        "name": "Rolled Oats with Low-Fat Milk",
        "portion": "1 bowl (50g oats + 150ml milk)",
        "calories": 280.0,
        "macros": {"protein_g": 12.5, "carbs_g": 42.0, "fats_g": 6.0},
        "micros": {
            "sugar_g": 8.0, "cholesterol_mg": 12.0, "sodium_mg": 110.0, "fiber_g": 5.2,
            "vitamin_a_mcg": 75.0, "vitamin_c_mg": 1.0, "vitamin_d_iu": 60.0, "vitamin_b12_mcg": 0.7,
            "iron_mg": 2.2, "calcium_mg": 210.0, "potassium_mg": 310.0
        },
        "category": "breakfast",
        "diet": "vegetarian"
    },
    "fresh apple": {
        "name": "Fresh Red Apple",
        "portion": "1 medium apple (180g)",
        "calories": 95.0,
        "macros": {"protein_g": 0.5, "carbs_g": 25.0, "fats_g": 0.3},
        "micros": {
            "sugar_g": 19.0, "cholesterol_mg": 0.0, "sodium_mg": 2.0, "fiber_g": 4.4,
            "vitamin_a_mcg": 5.0, "vitamin_c_mg": 8.5, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 0.2, "calcium_mg": 11.0, "potassium_mg": 195.0
        },
        "category": "fruit",
        "diet": "vegan"
    },
    "fresh banana": {
        "name": "Fresh Ripe Banana",
        "portion": "1 medium banana (120g)",
        "calories": 105.0,
        "macros": {"protein_g": 1.3, "carbs_g": 27.0, "fats_g": 0.3},
        "micros": {
            "sugar_g": 14.0, "cholesterol_mg": 0.0, "sodium_mg": 1.0, "fiber_g": 3.1,
            "vitamin_a_mcg": 4.0, "vitamin_c_mg": 10.0, "vitamin_d_iu": 0.0, "vitamin_b12_mcg": 0.0,
            "iron_mg": 0.3, "calcium_mg": 6.0, "potassium_mg": 420.0
        },
        "category": "fruit",
        "diet": "vegan"
    }
}

def lookup_food_by_name(query: str) -> Optional[FoodItem]:
    query_lower = query.lower().strip().replace("biriyani", "biryani")
    
    # 1. Direct Biryani mapping
    if "biryani" in query_lower:
        target_key = "vegetable biryani" if "veg" in query_lower else "chicken biryani"
        data = NUTRITION_DATABASE.get(target_key)
        if data:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.96,
                category=data.get("category", "lunch_main")
            )

    # 2. Chappathi / Chapati / Roti mapping
    if any(k in query_lower for k in ["chappathi", "chapathi", "chapati", "roti", "phulka", "chapatis", "chappathis"]):
        data = NUTRITION_DATABASE.get("whole wheat roti")
        if data:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.96,
                category=data.get("category", "grains")
            )

    # 3. Chicken Curry mapping
    if "chicken" in query_lower and ("curry" in query_lower or "gravy" in query_lower or "masala" in query_lower):
        data = NUTRITION_DATABASE.get("chicken curry")
        if data:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.96,
                category=data.get("category", "curry")
            )

    # 4. Apple mapping
    if "apple" in query_lower:
        data = NUTRITION_DATABASE.get("fresh apple")
        if data:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.97,
                category=data.get("category", "fruit")
            )

    # 5. Banana mapping
    if "banana" in query_lower:
        data = NUTRITION_DATABASE.get("fresh banana")
        if data:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.97,
                category=data.get("category", "fruit")
            )

    # General substring search
    for key, data in NUTRITION_DATABASE.items():
        if key in query_lower or query_lower in key:
            return FoodItem(
                name=data["name"],
                portion=data["portion"],
                calories=data["calories"],
                macros=MacroNutrients(**data["macros"]),
                micros=MicroNutrients(**data["micros"]),
                confidence=0.95,
                category=data.get("category", "general")
            )
    return None

def find_candidate_foods(diet_preference: str = "balanced", max_cholesterol: float = 300.0) -> List[dict]:
    candidates = []
    for key, val in NUTRITION_DATABASE.items():
        if diet_preference == "vegetarian" and val["diet"] == "non-veg":
            continue
        if diet_preference == "vegan" and val["diet"] in ["vegetarian", "non-veg"]:
            continue
        if val["micros"]["cholesterol_mg"] > max_cholesterol:
            continue
        candidates.append(val)
    return candidates
