import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { RecommendationResponse, MealRecommendation, UserProfile, MealType } from '../types';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  RefreshCw,
  Plus,
  Flame,
  Utensils,
  Lightbulb,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SmartMealSuggestionsWindowProps {
  user: UserProfile;
  selectedDate: string;
  onMealLogged: () => void;
  onOpenScanner?: () => void;
}

export const SmartMealSuggestionsWindow: React.FC<SmartMealSuggestionsWindowProps> = ({
  user,
  selectedDate,
  onMealLogged,
  onOpenScanner
}) => {
  const [data, setData] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loggingSlot, setLoggingSlot] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await api.getNextMealRecommendations(user.id, selectedDate);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      fetchRecommendations();
    }
  }, [user.id, selectedDate]);

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
        userId: user.id,
        mealType: slotType,
        date: selectedDate,
        items: rec.foods,
        notes: `AI Recommendation: ${rec.title}`
      });
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
      onMealLogged();
      await fetchRecommendations();
    } catch (err) {
      console.error('Failed to log recommended meal:', err);
    } finally {
      setLoggingSlot(null);
    }
  };

  const gap = data?.current_gap;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Sparkles className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Smart Next-Meal Suggestions</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Already ate breakfast (e.g. Dosa and Sambar)? Our algorithm checks your remaining caloric deficit and recommends targeted meals for <strong className="text-white">Afternoon Lunch</strong> and <strong className="text-white">Night Dinner</strong> to hit your exact fitness targets.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            {onOpenScanner && (
              <button
                type="button"
                onClick={onOpenScanner}
                className="py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Food</span>
              </button>
            )}
            <button
              type="button"
              onClick={fetchRecommendations}
              disabled={isLoading}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Recalculate Gap</span>
            </button>
          </div>
        </div>

        {/* Nutritional Gap Meter Strip */}
        {gap && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Cals</span>
              <span className="text-lg font-black text-emerald-400">{gap.calories_remaining} kcal</span>
              <span className="text-[10px] text-slate-500 block">for afternoon & dinner</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-blue-500/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Protein</span>
              <span className="text-lg font-black text-blue-400">{gap.protein_g_remaining}g</span>
              <span className="text-[10px] text-slate-500 block">essential for muscle</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-500/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Carbs</span>
              <span className="text-lg font-black text-amber-400">{gap.carbs_g_remaining}g</span>
              <span className="text-[10px] text-slate-500 block">energy & glycogen</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-pink-500/20">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Remaining Fats</span>
              <span className="text-lg font-black text-pink-400">{gap.fats_g_remaining}g</span>
              <span className="text-[10px] text-slate-500 block">healthy joints</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sugar Limit</span>
              <span className="text-lg font-black text-slate-300">≤ {gap.sugar_allowance_g}g</span>
              <span className="text-[10px] text-slate-500 block">safe ceiling</span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cholesterol</span>
              <span className="text-lg font-black text-slate-300">≤ {gap.cholesterol_allowance_mg}mg</span>
              <span className="text-[10px] text-slate-500 block">heart safe</span>
            </div>
          </div>
        )}
      </div>

      {/* Nutritionist Coach Banner */}
      {data?.nutritionist_tip && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-lg">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
              AI Dietician Assessment for {user.name} ({user.diet_style.replace('_', ' ')})
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {data.nutritionist_tip}
            </p>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Utensils className="w-4 h-4 text-emerald-400" />
            <span>Recommended Upcoming Meals</span>
          </h3>
          <span className="text-xs text-slate-400">Click "Quick Log" to automatically add to your plan</span>
        </div>

        {isLoading ? (
          <div className="text-center py-16 text-slate-400">Calculating optimal meal combinations...</div>
        ) : !data || data.recommendations.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="text-base font-bold text-white">Daily Targets Reached!</h4>
            <p className="text-xs max-w-md mx-auto text-slate-400">
              You've satisfied your daily calorie and protein budget. Drink plenty of water and allow your muscles to recover overnight.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.recommendations.map((rec) => {
              const isLogging = loggingSlot === rec.meal_slot;

              return (
                <div
                  key={rec.meal_slot}
                  className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 flex flex-col justify-between transition-all hover:shadow-2xl group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    {/* Meal Slot Badge & Calorie Banner */}
                    <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{rec.meal_slot}</span>
                      </div>
                      <span className="text-xs font-black text-amber-400 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{rec.total_calories} kcal</span>
                      </span>
                    </div>

                    {/* Meal Title & Description */}
                    <div>
                      <h4 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                        {rec.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {rec.description}
                      </p>
                    </div>

                    {/* Macro Breakdown Strip */}
                    <div className="grid grid-cols-3 gap-2 text-center bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Protein</span>
                        <span className="text-xs font-black text-blue-400">{rec.total_protein}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
                        <span className="text-xs font-black text-amber-400">{rec.total_carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Fats</span>
                        <span className="text-xs font-black text-pink-400">{rec.total_fats}g</span>
                      </div>
                    </div>

                    {/* Individual Foods in this meal */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Included Foods:
                      </span>
                      {rec.foods.map((food, fIdx) => (
                        <div
                          key={fIdx}
                          className="bg-slate-950/50 rounded-lg p-2 text-xs flex items-center justify-between border border-slate-800/50"
                        >
                          <div>
                            <span className="font-semibold text-slate-200 block">{food.name}</span>
                            <span className="text-[10px] text-slate-400">{food.portion}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[11px] font-bold text-slate-300">{food.calories} kcal</span>
                            <span className="text-[10px] text-blue-400 block">{food.macros.protein_g}g P</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Health Benefits */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {rec.key_benefits.map((b, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/20"
                        >
                          ✓ {b}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Quick Log Button */}
                  <div className="pt-4 mt-4 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => handleQuickLog(rec)}
                      disabled={isLogging}
                      className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/15 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isLogging ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Logging to Plan...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Quick Log This Meal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
