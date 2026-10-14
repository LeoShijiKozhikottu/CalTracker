export type FitnessGoal = 'bulking' | 'cutting' | 'overweight_loss' | 'maintenance' | 'recomposition' | 'athletic_performance';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
export type DietStyle = 'balanced' | 'high_protein' | 'vegetarian' | 'vegan' | 'keto' | 'low_carb';
export type MealType = 'breakfast' | 'lunch' | 'snack' | 'dinner';

export type WindowTab = 'dashboard' | 'scanner' | 'suggestions' | 'exercises' | 'friends' | 'profile';

export interface MacroNutrients {
  protein_g: number;
  carbs_g: number;
  fats_g: number;
}

export interface MicroNutrients {
  sugar_g: number;
  cholesterol_mg: number;
  sodium_mg: number;
  fiber_g: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_iu: number;
  vitamin_b12_mcg: number;
  iron_mg: number;
  calcium_mg: number;
  potassium_mg: number;
}

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  macros: MacroNutrients;
  micros: MicroNutrients;
  confidence?: number;
  category?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  diet_style: DietStyle;
  bmr: number;
  tdee: number;
  target_calories: number;
  target_macros: MacroNutrients;
  target_micros: MicroNutrients;
  created_at?: string;
  updated_at?: string;
}

export interface MealLog {
  id: string;
  user_id: string;
  meal_type: MealType;
  date: string;
  items: FoodItem[];
  total_calories: number;
  total_macros: MacroNutrients;
  total_micros: MicroNutrients;
  notes?: string;
  image_url?: string;
  created_at?: string;
}

export interface DailyIntakeSummary {
  user_id: string;
  date: string;
  target_calories: number;
  consumed_calories: number;
  remaining_calories: number;
  target_macros: MacroNutrients;
  consumed_macros: MacroNutrients;
  remaining_macros: MacroNutrients;
  target_micros: MicroNutrients;
  consumed_micros: MicroNutrients;
  remaining_micros: MicroNutrients;
  meals: MealLog[];
  calorie_progress_pct: number;
  protein_progress_pct: number;
  calories_burned?: number;
  net_calories?: number;
}

export interface MealRecommendation {
  meal_slot: string;
  title: string;
  description: string;
  foods: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  key_benefits: string[];
  dietary_match: string;
}

export interface RecommendationResponse {
  user_id: string;
  date: string;
  current_gap: {
    calories_remaining: number;
    protein_g_remaining: number;
    carbs_g_remaining: number;
    fats_g_remaining: number;
    sugar_allowance_g: number;
    cholesterol_allowance_mg: number;
  };
  recommendations: MealRecommendation[];
  nutritionist_tip: string;
}

// Exercise & Gym Types
export type ExerciseCategory = 'overweight' | 'weight_loss' | 'muscle_gain' | 'athletic';

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  target_muscles: string[];
  difficulty: string;
  equipment: string;
  calories_per_20min: number;
  recommended_sets_reps: string;
  description: string;
  safety_and_form_tip: string;
  icon_name?: string;
}

export interface ExerciseLog {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  date: string;
  duration_minutes: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  calories_burned: number;
  notes?: string;
  created_at?: string;
}

export interface ExerciseLogCreate {
  user_id: string;
  exercise_id: string;
  exercise_name: string;
  date: string;
  duration_minutes: number;
  sets?: number;
  reps?: number;
  weight_kg?: number;
  calories_burned: number;
  notes?: string;
}

// Friend Comparison Type
export interface FriendComparisonItem {
  user_id: string;
  name: string;
  gender: string;
  weight_kg: number;
  fitness_goal: string;
  diet_style: string;
  target_calories: number;
  consumed_calories: number;
  calorie_progress_pct: number;
  target_protein: number;
  consumed_protein: number;
  protein_progress_pct: number;
  calories_burned_today: number;
  workouts_count_today: number;
  streak_days: number;
  status_badge: string;
}

// Authentication Types
export interface UserRegister {
  name: string;
  email: string;
  password: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  activity_level: ActivityLevel;
  fitness_goal: FitnessGoal;
  diet_style: DietStyle;
  custom_calorie_target?: number;
  custom_protein_target?: number;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

