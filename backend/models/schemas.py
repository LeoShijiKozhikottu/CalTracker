from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class FitnessGoal(str, Enum):
    BULKING = "bulking"
    CUTTING = "cutting"
    OVERWEIGHT_LOSS = "overweight_loss"
    MAINTENANCE = "maintenance"
    RECOMPOSITION = "recomposition"
    ATHLETIC_PERFORMANCE = "athletic_performance"

class ActivityLevel(str, Enum):
    SEDENTARY = "sedentary"
    LIGHTLY_ACTIVE = "lightly_active"
    MODERATELY_ACTIVE = "moderately_active"
    VERY_ACTIVE = "very_active"
    EXTRA_ACTIVE = "extra_active"

class DietStyle(str, Enum):
    BALANCED = "balanced"
    HIGH_PROTEIN = "high_protein"
    VEGETARIAN = "vegetarian"
    VEGAN = "vegan"
    KETO = "keto"
    LOW_CARB = "low_carb"

class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    SNACK = "snack"
    DINNER = "dinner"

class MacroNutrients(BaseModel):
    protein_g: float = 0.0
    carbs_g: float = 0.0
    fats_g: float = 0.0

class MicroNutrients(BaseModel):
    sugar_g: float = 0.0
    cholesterol_mg: float = 0.0
    sodium_mg: float = 0.0
    fiber_g: float = 0.0
    vitamin_a_mcg: float = 0.0
    vitamin_c_mg: float = 0.0
    vitamin_d_iu: float = 0.0
    vitamin_b12_mcg: float = 0.0
    iron_mg: float = 0.0
    calcium_mg: float = 0.0
    potassium_mg: float = 0.0

class FoodItem(BaseModel):
    name: str
    portion: str = "1 serving"
    calories: float = 0.0
    macros: MacroNutrients = Field(default_factory=MacroNutrients)
    micros: MicroNutrients = Field(default_factory=MicroNutrients)
    confidence: Optional[float] = 0.95
    category: Optional[str] = "meal"

class MealLogCreate(BaseModel):
    user_id: str
    meal_type: MealType
    date: str  # YYYY-MM-DD
    items: List[FoodItem] = []
    notes: Optional[str] = ""
    image_url: Optional[str] = None

class MealLog(BaseModel):
    id: str
    user_id: str
    meal_type: MealType
    date: str
    items: List[FoodItem]
    total_calories: float
    total_macros: MacroNutrients
    total_micros: MicroNutrients
    notes: Optional[str] = ""
    image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserProfileCreate(BaseModel):
    name: str
    age: int = 25
    gender: str = "male"
    height_cm: float = 175.0
    weight_kg: float = 72.0
    activity_level: ActivityLevel = ActivityLevel.MODERATELY_ACTIVE
    fitness_goal: FitnessGoal = FitnessGoal.BULKING
    diet_style: DietStyle = DietStyle.HIGH_PROTEIN
    custom_calorie_target: Optional[float] = None
    custom_protein_target: Optional[float] = None

class UserProfile(BaseModel):
    id: str
    name: str
    age: int
    gender: str
    height_cm: float
    weight_kg: float
    activity_level: ActivityLevel
    fitness_goal: FitnessGoal
    diet_style: DietStyle
    bmr: float
    tdee: float
    target_calories: float
    target_macros: MacroNutrients
    target_micros: MicroNutrients
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DailyIntakeSummary(BaseModel):
    user_id: str
    date: str
    target_calories: float
    consumed_calories: float
    remaining_calories: float
    target_macros: MacroNutrients
    consumed_macros: MacroNutrients
    remaining_macros: MacroNutrients
    target_micros: MicroNutrients
    consumed_micros: MicroNutrients
    remaining_micros: MicroNutrients
    meals: List[MealLog]
    calorie_progress_pct: float
    protein_progress_pct: float
    calories_burned: float = 0.0
    net_calories: float = 0.0

class MealRecommendation(BaseModel):
    meal_slot: str  # e.g., "Afternoon Lunch", "Dinner", "Evening Snack"
    title: str
    description: str
    foods: List[FoodItem]
    total_calories: float
    total_protein: float
    total_carbs: float
    total_fats: float
    key_benefits: List[str] = []
    dietary_match: str = "balanced"

class RecommendationResponse(BaseModel):
    user_id: str
    date: str
    current_gap: dict
    recommendations: List[MealRecommendation]
    nutritionist_tip: str

# --- Authentication Schemas ---
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    age: int = 25
    gender: str = "male"
    height_cm: float = 175.0
    weight_kg: float = 72.0
    activity_level: ActivityLevel = ActivityLevel.MODERATELY_ACTIVE
    fitness_goal: FitnessGoal = FitnessGoal.BULKING
    diet_style: DietStyle = DietStyle.HIGH_PROTEIN
    custom_calorie_target: Optional[float] = None
    custom_protein_target: Optional[float] = None

class UserLogin(BaseModel):
    email: str
    password: str

class AuthToken(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile

# --- Workout & Gym Exercise Schemas ---
class ExerciseCategory(str, Enum):
    OVERWEIGHT = "overweight"
    WEIGHT_LOSS = "weight_loss"
    MUSCLE_GAIN = "muscle_gain"
    ATHLETIC = "athletic"

class ExerciseItem(BaseModel):
    id: str
    name: str
    category: ExerciseCategory
    target_muscles: List[str]
    difficulty: str  # Beginner, Intermediate, Advanced
    equipment: str
    calories_per_20min: float
    recommended_sets_reps: str
    description: str
    safety_and_form_tip: str
    icon_name: Optional[str] = "dumbbell"

class ExerciseLogCreate(BaseModel):
    user_id: str
    exercise_id: str
    exercise_name: str
    date: str  # YYYY-MM-DD
    duration_minutes: float = 20.0
    sets: Optional[int] = 3
    reps: Optional[int] = 12
    weight_kg: Optional[float] = 0.0
    calories_burned: float = 150.0
    notes: Optional[str] = ""

class ExerciseLog(BaseModel):
    id: str
    user_id: str
    exercise_id: str
    exercise_name: str
    date: str
    duration_minutes: float
    sets: Optional[int] = 3
    reps: Optional[int] = 12
    weight_kg: Optional[float] = 0.0
    calories_burned: float
    notes: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

# --- Community & Friend Comparison Schemas ---
class FriendComparisonItem(BaseModel):
    user_id: str
    name: str
    gender: str
    weight_kg: float
    fitness_goal: str
    diet_style: str
    target_calories: float
    consumed_calories: float
    calorie_progress_pct: float
    target_protein: float
    consumed_protein: float
    protein_progress_pct: float
    calories_burned_today: float
    workouts_count_today: int
    streak_days: int
    status_badge: str

