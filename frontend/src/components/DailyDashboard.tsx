import React, { useEffect } from 'react';
import type { DailyIntakeSummary, UserProfile } from '../types';
import { Activity, Zap, Heart, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyDashboardProps {
  summary: DailyIntakeSummary | null;
  profile: UserProfile | null;
}

export const DailyDashboard: React.FC<DailyDashboardProps> = ({ summary, profile }) => {
  if (!summary || !profile) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center animate-pulse">
        <div className="h-4 bg-slate-800 rounded w-1/4 mx-auto mb-4"></div>
        <div className="h-8 bg-slate-800 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  const {
    target_calories,
    consumed_calories,
    remaining_calories,
    target_macros,
    consumed_macros,
    remaining_macros,
    consumed_micros,
    target_micros,
    calorie_progress_pct,
    protein_progress_pct
  } = summary;

  // Trigger celebration if protein or calories target reached without excessive overflow
  useEffect(() => {
    if (calorie_progress_pct >= 95 && calorie_progress_pct <= 108) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    }
  }, [calorie_progress_pct]);

  // Micro limits analysis
  const sugarExceeded = consumed_micros.sugar_g > (target_micros?.sugar_g || 40);
  const cholExceeded = consumed_micros.cholesterol_mg > (target_micros?.cholesterol_mg || 300);

  return (
    <div className="space-y-6">
      
      {/* Top Banner: Profile Target Details */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800/90 to-slate-900 border border-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl sm:text-2xl font-black text-white">{profile.name}'s Daily Plan</span>
              <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full border border-emerald-500/20 capitalize">
                {profile.fitness_goal.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Diet Style: <span className="text-slate-200 capitalize font-medium">{profile.diet_style.replace('_', ' ')}</span> • Weight: <span className="text-slate-200 font-medium">{profile.weight_kg} kg</span> • BMR: <span className="text-slate-200 font-medium">{profile.bmr} kcal</span> • TDEE: <span className="text-slate-200 font-medium">{profile.tdee} kcal</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Daily Target</span>
              <span className="text-base font-extrabold text-white">{target_calories} <span className="text-[10px] font-semibold text-slate-400">kcal</span></span>
            </div>
            <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Consumed</span>
              <span className="text-base font-extrabold text-white">{consumed_calories} <span className="text-[10px] font-semibold text-slate-400">kcal</span></span>
            </div>
            <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl px-3 py-1.5 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400 block">Gym Burned</span>
              <span className="text-base font-extrabold text-amber-300">-{summary.calories_burned || 0} <span className="text-[10px] font-semibold text-amber-500">kcal</span></span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-800/40 rounded-xl px-3 py-1.5 text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">Remaining</span>
              <span className="text-base font-extrabold text-emerald-300">{remaining_calories} <span className="text-[10px] font-semibold text-emerald-500">kcal</span></span>
            </div>
          </div>
        </div>

        {/* Big Calorie Progress Bar */}
        <div className="mt-5 space-y-2">
          <div className="flex justify-between text-xs font-medium text-slate-300">
            <span>Intake: <strong className="text-white">{consumed_calories} kcal</strong> • Gym Burn: <strong className="text-amber-400">-{summary.calories_burned || 0} kcal</strong> • Net: <strong className="text-emerald-400">{summary.net_calories ?? consumed_calories} kcal</strong></span>
            <span>{calorie_progress_pct}% of target</span>
          </div>
          <div className="h-3 w-full bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                calorie_progress_pct > 105
                  ? 'bg-gradient-to-r from-amber-500 to-red-500'
                  : 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400'
              }`}
              style={{ width: `${Math.min(calorie_progress_pct, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3 Major Gym Macros Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Protein Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Protein</span>
                <p className="text-[10px] text-blue-400 font-medium">Muscle Synthesis</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-blue-400">{protein_progress_pct}%</span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white">{consumed_macros.protein_g} <span className="text-xs font-normal text-slate-400">/ {target_macros.protein_g}g</span></span>
            <span className="text-xs text-slate-400 font-medium">Need: <strong className="text-blue-300 font-bold">{remaining_macros.protein_g}g</strong></span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(protein_progress_pct, 100)}%` }}
            />
          </div>
        </div>

        {/* Carbohydrates Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Carbs</span>
                <p className="text-[10px] text-amber-400 font-medium">Workout Energy</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-amber-400">
              {Math.round((consumed_macros.carbs_g / (target_macros.carbs_g || 1)) * 100)}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white">{consumed_macros.carbs_g} <span className="text-xs font-normal text-slate-400">/ {target_macros.carbs_g}g</span></span>
            <span className="text-xs text-slate-400 font-medium">Need: <strong className="text-amber-300 font-bold">{remaining_macros.carbs_g}g</strong></span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((consumed_macros.carbs_g / (target_macros.carbs_g || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Healthy Fats Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden group hover:border-pink-500/40 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Healthy Fats</span>
                <p className="text-[10px] text-pink-400 font-medium">Hormones & Joints</p>
              </div>
            </div>
            <span className="text-xs font-extrabold text-pink-400">
              {Math.round((consumed_macros.fats_g / (target_macros.fats_g || 1)) * 100)}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="text-2xl font-black text-white">{consumed_macros.fats_g} <span className="text-xs font-normal text-slate-400">/ {target_macros.fats_g}g</span></span>
            <span className="text-xs text-slate-400 font-medium">Need: <strong className="text-pink-300 font-bold">{remaining_macros.fats_g}g</strong></span>
          </div>

          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((consumed_macros.fats_g / (target_macros.fats_g || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

      </div>

      {/* Enhanced Micronutrients & Vital Health Indicators (Sugar, Cholesterol, Vitamins) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Micronutrients & Health Limits</h3>
          </div>
          <span className="text-xs text-slate-400">Daily Health DRI Monitoring</span>
        </div>

        {/* Health Limit Warnings: Sugar & Cholesterol */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          
          {/* Sugar Limit */}
          <div className={`p-3 rounded-xl border ${sugarExceeded ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/50 border-slate-700/50'} flex items-center justify-between`}>
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Added Sugar</span>
              <span className="text-lg font-black text-white">{consumed_micros.sugar_g}g <span className="text-xs font-normal text-slate-400">/ max 40g</span></span>
            </div>
            {sugarExceeded ? (
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded">High Sugar</span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Safe</span>
            )}
          </div>

          {/* Cholesterol Limit */}
          <div className={`p-3 rounded-xl border ${cholExceeded ? 'bg-amber-500/10 border-amber-500/30' : 'bg-slate-800/50 border-slate-700/50'} flex items-center justify-between`}>
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Cholesterol</span>
              <span className="text-lg font-black text-white">{consumed_micros.cholesterol_mg}mg <span className="text-xs font-normal text-slate-400">/ 300mg</span></span>
            </div>
            {cholExceeded ? (
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">Check Limit</span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">Healthy</span>
            )}
          </div>

          {/* Dietary Fiber */}
          <div className="p-3 rounded-xl border bg-slate-800/50 border-slate-700/50 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-300 block">Dietary Fiber</span>
              <span className="text-lg font-black text-white">{consumed_micros.fiber_g}g <span className="text-xs font-normal text-slate-400">/ 35g</span></span>
            </div>
            <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded">Gut Health</span>
          </div>

        </div>

        {/* Vitamins & Minerals Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Vit C</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.vitamin_c_mg} mg</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Vit D</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.vitamin_d_iu} IU</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Vit B12</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.vitamin_b12_mcg} mcg</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Vit A</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.vitamin_a_mcg} mcg</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Iron</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.iron_mg} mg</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Calcium</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.calcium_mg} mg</span>
          </div>
          <div className="bg-slate-800/30 rounded-lg p-2 text-center border border-slate-800">
            <span className="text-[10px] text-slate-400 font-semibold block">Potassium</span>
            <span className="text-xs font-bold text-slate-200">{consumed_micros.potassium_mg} mg</span>
          </div>
        </div>

      </div>

    </div>
  );
};
