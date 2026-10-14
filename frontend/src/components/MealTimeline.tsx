import React from 'react';
import type { MealLog, MealType } from '../types';
import { Coffee, Sun, Apple, Moon, Trash2, Plus } from 'lucide-react';
import { api } from '../api/client';

interface MealTimelineProps {
  meals: MealLog[];
  onOpenScanner: (slot?: MealType) => void;
  onMealDeleted: () => void;
}

const MEAL_SLOTS: { type: MealType; title: string; icon: any; time: string }[] = [
  { type: 'breakfast', title: 'Breakfast', icon: Coffee, time: '7:00 AM - 10:00 AM' },
  { type: 'lunch', title: 'Afternoon Lunch', icon: Sun, time: '12:30 PM - 2:30 PM' },
  { type: 'snack', title: 'Evening Snack', icon: Apple, time: '5:00 PM - 6:30 PM' },
  { type: 'dinner', title: 'Night Dinner', icon: Moon, time: '8:00 PM - 9:30 PM' },
];

export const MealTimeline: React.FC<MealTimelineProps> = ({
  meals,
  onOpenScanner,
  onMealDeleted
}) => {
  const handleDelete = async (mealId: string) => {
    if (!window.confirm('Delete this logged meal?')) return;
    try {
      await api.deleteMeal(mealId);
      onMealDeleted();
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-extrabold text-white">Today's Meal Timeline</h3>
        <span className="text-xs text-slate-400">Tracked Meals & Portions</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEAL_SLOTS.map((slot) => {
          const slotMeals = meals.filter((m) => m.meal_type === slot.type);
          const Icon = slot.icon;
          const totalSlotCals = slotMeals.reduce((acc, m) => acc + m.total_calories, 0);
          const totalSlotP = slotMeals.reduce((acc, m) => acc + m.total_macros.protein_g, 0);

          return (
            <div
              key={slot.type}
              className={`rounded-2xl border p-5 transition-all ${
                slotMeals.length > 0
                  ? 'bg-slate-900/90 border-slate-800'
                  : 'bg-slate-900/40 border-slate-800/60 border-dashed'
              }`}
            >
              {/* Slot Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    slotMeals.length > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{slot.title}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{slot.time}</span>
                  </div>
                </div>

                {slotMeals.length > 0 ? (
                  <div className="text-right">
                    <span className="text-sm font-black text-white">{Math.round(totalSlotCals)} kcal</span>
                    <span className="text-[10px] text-blue-400 block font-semibold">{Math.round(totalSlotP)}g protein</span>
                  </div>
                ) : (
                  <button
                    onClick={() => onOpenScanner(slot.type)}
                    className="flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log</span>
                  </button>
                )}
              </div>

              {/* Slot Content */}
              {slotMeals.length > 0 ? (
                <div className="space-y-3">
                  {slotMeals.map((meal) => (
                    <div
                      key={meal.id}
                      className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 space-y-2 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        
                        {/* Food Image Preview if logged */}
                        {meal.image_url && (
                          <img
                            src={meal.image_url}
                            alt="Meal photo"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        )}

                        <div className="flex-1">
                          <div className="space-y-1">
                            {meal.items.map((item, iIdx) => (
                              <div key={iIdx} className="text-xs text-slate-200 flex justify-between">
                                <span>{item.name} <span className="text-[10px] text-slate-400">({item.portion})</span></span>
                                <span className="text-slate-400 font-medium">{item.calories} kcal</span>
                              </div>
                            ))}
                          </div>
                          
                          {/* Micronutrients Snippet */}
                          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400 pt-1.5 mt-1 border-t border-slate-700/40">
                            <span>Sugar: {meal.total_micros.sugar_g}g</span>
                            <span>Chol: {meal.total_micros.cholesterol_mg}mg</span>
                            <span>Vit C: {meal.total_micros.vitamin_c_mg}mg</span>
                            <span>Iron: {meal.total_micros.iron_mg}mg</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(meal.id)}
                          title="Delete meal"
                          className="text-slate-500 hover:text-red-400 p-1 transition-colors opacity-70 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {meal.notes && (
                        <p className="text-[11px] text-emerald-400/90 italic bg-emerald-500/5 p-1.5 rounded-lg border border-emerald-500/10">
                          {meal.notes}
                        </p>
                      )}
                    </div>
                  ))}
                  
                  <button
                    onClick={() => onOpenScanner(slot.type)}
                    className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                  >
                    + Add more to {slot.title}
                  </button>
                </div>
              ) : (
                <div className="py-5 text-center">
                  <p className="text-xs text-slate-400">No food logged yet for this slot.</p>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};
