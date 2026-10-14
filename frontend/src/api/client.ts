import type {
  UserProfile,
  DailyIntakeSummary,
  MealLog,
  RecommendationResponse,
  FoodItem,
  MealType
} from '../types';

const API_BASE = '/api';

export const api = {
  // Profiles
  async getProfiles(): Promise<UserProfile[]> {
    const res = await fetch(`${API_BASE}/profiles`);
    if (!res.ok) throw new Error('Failed to fetch profiles');
    return res.json();
  },

  async createProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profiles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create profile');
    return res.json();
  },

  async updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  async deleteProfile(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/profiles/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete profile');
  },

  // Meals
  async getDailySummary(userId: string, date: string): Promise<DailyIntakeSummary> {
    const res = await fetch(`${API_BASE}/meals/daily-summary?user_id=${userId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch daily summary');
    return res.json();
  },

  async logMeal(params: {
    userId: string;
    mealType: MealType;
    date: string;
    items: FoodItem[];
    notes?: string;
    imageUrl?: string;
  }): Promise<MealLog> {
    const res = await fetch(`${API_BASE}/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: params.userId,
        meal_type: params.mealType,
        date: params.date,
        items: params.items,
        notes: params.notes || '',
        image_url: params.imageUrl || null
      })
    });
    if (!res.ok) throw new Error('Failed to log meal');
    return res.json();
  },

  async deleteMeal(mealId: string): Promise<void> {
    const res = await fetch(`${API_BASE}/meals/${mealId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete meal');
  },

  // Vision AI
  async analyzeFoodImage(file: File, dishHint?: string): Promise<{
    items: FoodItem[];
    image_url: string;
    fitness_insight: string;
    total_calories: number;
    total_macros: any;
    total_micros: any;
    is_live_ai?: boolean;
    gemini_api_configured?: boolean;
  }> {
    const formData = new FormData();
    formData.append('image', file);
    if (dishHint) formData.append('custom_dish_hint', dishHint);

    const res = await fetch(`${API_BASE}/vision/analyze-food`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Vision analysis failed' }));
      throw new Error(err.detail || 'Vision analysis failed');
    }
    return res.json();
  },

  async getVisionStatus(): Promise<{ gemini_api_configured: boolean; mode: string }> {
    try {
      const res = await fetch(`${API_BASE}/vision/status`);
      if (!res.ok) return { gemini_api_configured: false, mode: 'smart_offline_analyzer' };
      return res.json();
    } catch {
      return { gemini_api_configured: false, mode: 'smart_offline_analyzer' };
    }
  },

  async setGeminiApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/vision/set-api-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: apiKey })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to set key' }));
      throw new Error(err.detail || 'Failed to set key');
    }
    return res.json();
  },

  // Recommendations
  async getNextMealRecommendations(userId: string, date: string): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations/next-meal?user_id=${userId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch recommendations');
    return res.json();
  },

  // Auth
  async login(payload: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  },

  async register(payload: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(err.detail || 'Registration failed');
    }
    return res.json();
  },

  // Exercises & Gym
  async getExercises(category?: string) {
    const url = category ? `${API_BASE}/exercises?category=${category}` : `${API_BASE}/exercises`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch exercises');
    return res.json();
  },

  async logExercise(payload: {
    userId: string;
    exerciseId: string;
    exerciseName: string;
    date: string;
    durationMinutes: number;
    sets?: number;
    reps?: number;
    weightKg?: number;
    caloriesBurned: number;
    notes?: string;
  }) {
    const res = await fetch(`${API_BASE}/exercises/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: payload.userId,
        exercise_id: payload.exerciseId,
        exercise_name: payload.exerciseName,
        date: payload.date,
        duration_minutes: payload.durationMinutes,
        sets: payload.sets ?? 3,
        reps: payload.reps ?? 12,
        weight_kg: payload.weightKg ?? 0,
        calories_burned: payload.caloriesBurned,
        notes: payload.notes || ''
      })
    });
    if (!res.ok) throw new Error('Failed to log exercise');
    return res.json();
  },

  async getDailyWorkouts(userId: string, date: string) {
    const res = await fetch(`${API_BASE}/exercises/logs/daily?user_id=${userId}&date=${date}`);
    if (!res.ok) throw new Error('Failed to fetch workout logs');
    return res.json();
  },

  async deleteWorkoutLog(logId: string) {
    const res = await fetch(`${API_BASE}/exercises/logs/${logId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete workout log');
  },

  // Community & Friends
  async getFriendsProgress(date?: string) {
    const url = date ? `${API_BASE}/community/friends?date=${date}` : `${API_BASE}/community/friends`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch friends progress');
    return res.json();
  },

  async compareFriends(user1Id: string, user2Id: string, date?: string) {
    const url = `${API_BASE}/community/compare?user1_id=${user1Id}&user2_id=${user2Id}${date ? `&date=${date}` : ''}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch comparison');
    return res.json();
  }
};
