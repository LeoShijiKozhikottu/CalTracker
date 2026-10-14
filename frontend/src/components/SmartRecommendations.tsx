import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { RecommendationResponse, MealRecommendation, UserProfile, MealType } from '../types';
import {
  Compass,
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus
} from 'lucide-react';

interface SmartRecommendationsProps {
  userId: string;
  selectedDate: string;
  profile: UserProfile | null;
  onMealLogged: () => void;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  selectedDate,
  profile: _profile,
  onMealLogged
}) => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loggingSlot, setLoggingSlot] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNextMealRecommendations(userId, selectedDate);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchRecommendations();
    }
  }, [userId, selectedDate]);

  const handleQuickLog = async (rec: MealRecommendation) => {
    setLoggingSlot(rec.meal_slot);
    try {
      let slotType: MealType = 'lunch';
      if (rec.meal_slot.toLowerCase().includes('dinner')) {
        slotType = 'dinner';
      } else if (rec.meal_slot.toLowerCase().includes('snack')) {
        slotType = 'snack';
      }

      await api.logMeal({
        userId,
        mealType: slotType,
        date: selectedDate,
        items: rec.foods,
        notes: `AI Recommendation: ${rec.title}`
      });
      onMealLogged();
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to log recommended meal:', err);
    } finally {
      setLoggingSlot(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/3 mx-auto mb-3"></div>
        <div className="h-6 bg-slate-800 rounded w-2/3 mx-auto"></div>
      </div>
    );
  }

  if (!data || data.recommendations.length === 0) {
    return (
      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6 text-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
        <h4 className="text-base font-bold text-white">Daily Nutritional Goals Met!</h4>
        <p className="text-xs text-slate-300 mt-1">
          You have achieved all target calories and macronutrients for today. Great dedication!
        </p>
      </div>
    );
  }

  const { current_gap, recommendations, nutritionist_tip } = data;

  return (
    <div className="space-y-4">
      
      {/* Title & Gap Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">Smart Diet Completion Recommendations</h3>
            <p className="text-xs text-slate-400">What to eat next to hit your daily gym targets</p>
          </div>
        </div>

        <button
          onClick={fetchRecommendations}
          className="text-xs text-slate-400 hover:text-emerald-400 flex items-center gap-1 self-start sm:self-auto transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {/* Dynamic Context Banner: e.g. "After your breakfast..." */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/40 border border-emerald-500/30 flex items-start gap-3 shadow-md">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
            {nutritionist_tip}
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-semibold">
            <span className="text-emerald-400">Remaining to consume:</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-white">{current_gap.calories_remaining} kcal</span>
            <span className="bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded">{current_gap.protein_g_remaining}g Protein</span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded">{current_gap.carbs_g_remaining}g Carbs</span>
            <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Sugar Allowance: {current_gap.sugar_allowance_g}g</span>
          </div>
        </div>
      </div>

      {/* Suggested Meals Carousel/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all group"
          >
            <div>
              {/* Slot Badge & Slot Title */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  {rec.meal_slot}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {rec.dietary_match.replace('_', ' ')}
                </span>
              </div>

              {/* Title & Description */}
              <h4 className="text-base font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {rec.description}
              </p>

              {/* Food Items Preview */}
              <div className="my-3 py-2.5 px-3 bg-slate-800/40 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Suggested Plate:</span>
                {rec.foods.map((food, fIdx) => (
                  <div key={fIdx} className="flex justify-between text-xs text-slate-300">
                    <span>{food.name} <span className="text-[10px] text-slate-400">({food.portion})</span></span>
                    <span className="font-semibold text-slate-400">{food.calories} kcal</span>
                  </div>
                ))}
              </div>

              {/* Key Benefits Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {rec.key_benefits.map((benefit, bIdx) => (
                  <span
                    key={bIdx}
                    className="text-[10px] font-semibold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700/60"
                  >
                    ✓ {benefit}
                  </span>
                ))}
              </div>
            </div>

            {/* Nutrition Sum & Quick Log Button */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="text-xs">
                <span className="text-base font-black text-white">{rec.total_calories} <span className="text-[10px] font-normal text-slate-400">kcal</span></span>
                <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-0.5">
                  <span className="text-blue-400">{rec.total_protein}g P</span>
                  <span className="text-amber-400">{rec.total_carbs}g C</span>
                  <span className="text-pink-400">{rec.total_fats}g F</span>
                </div>
              </div>

              <button
                onClick={() => handleQuickLog(rec)}
                disabled={loggingSlot === rec.meal_slot}
                className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
              >
                {loggingSlot === rec.meal_slot ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Logging...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Quick Log Meal</span>
                  </>
                )}
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
