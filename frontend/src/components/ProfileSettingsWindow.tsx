import React, { useState, useEffect } from 'react';
import type { UserProfile, FitnessGoal, ActivityLevel, DietStyle } from '../types';
import { api } from '../api/client';
import {
  User,
  CheckCircle2,
  AlertCircle,
  Scale,
  LogOut,
  Save
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileSettingsWindowProps {
  profile: UserProfile;
  onProfileUpdated: (updated: UserProfile) => void;
  onLogout: () => void;
  onSwitchAccount: () => void;
}

export const ProfileSettingsWindow: React.FC<ProfileSettingsWindowProps> = ({
  profile,
  onProfileUpdated,
  onLogout,
  onSwitchAccount
}) => {
  const [name, setName] = useState(profile.name);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState(profile.gender);
  const [heightCm, setHeightCm] = useState(profile.height_cm);
  const [weightKg, setWeightKg] = useState(profile.weight_kg);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(profile.activity_level);
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>(profile.fitness_goal);
  const [dietStyle, setDietStyle] = useState<DietStyle>(profile.diet_style);
  const [customCalories, setCustomCalories] = useState<string>(
    profile.target_calories ? String(profile.target_calories) : ''
  );
  const [customProtein, setCustomProtein] = useState<string>(
    profile.target_macros?.protein_g ? String(profile.target_macros.protein_g) : ''
  );
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setName(profile.name);
    setAge(profile.age);
    setGender(profile.gender);
    setHeightCm(profile.height_cm);
    setWeightKg(profile.weight_kg);
    setActivityLevel(profile.activity_level);
    setFitnessGoal(profile.fitness_goal);
    setDietStyle(profile.diet_style);
    setCustomCalories(profile.target_calories ? String(profile.target_calories) : '');
    setCustomProtein(profile.target_macros?.protein_g ? String(profile.target_macros.protein_g) : '');
    setSuccessMsg(null);
    setErrorMsg(null);
  }, [profile.id]);

  // Client-side quick preview of Mifflin-St Jeor calculation
  const bmrEst =
    gender.toLowerCase() === 'female'
      ? 10 * weightKg + 6.25 * heightCm - 5 * age - 161
      : 10 * weightKg + 6.25 * heightCm - 5 * age + 5;

  const activityMultipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9
  };
  const tdeeEst = Math.round(bmrEst * (activityMultipliers[activityLevel] || 1.55));

  let goalCals = tdeeEst;
  if (fitnessGoal === 'bulking') goalCals += 400;
  else if (fitnessGoal === 'cutting') goalCals = Math.max(tdeeEst - 450, 1200);
  else if (fitnessGoal === 'overweight_loss') goalCals = Math.max(tdeeEst - 550, 1300);
  else if (fitnessGoal === 'recomposition') goalCals -= 100;
  else if (fitnessGoal === 'athletic_performance') goalCals += 200;

  const previewCalories = customCalories ? Number(customCalories) : goalCals;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      const payload: Partial<UserProfile> = {
        name,
        age,
        gender,
        height_cm: heightCm,
        weight_kg: weightKg,
        activity_level: activityLevel,
        fitness_goal: fitnessGoal,
        diet_style: dietStyle,
        target_calories: customCalories ? Number(customCalories) : undefined
      };

      const updated = await api.updateProfile(profile.id, payload);
      onProfileUpdated(updated);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      setSuccessMsg('Your diet profile and targets have been updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <User className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">My Diet & Body Profile</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Every gym friend has unique dietary requirements. Customize your physical metrics, fitness goals (cutting, bulking, overweight safe deficit), and dietary style to get scientific BMR and TDEE calorie formulas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSwitchAccount}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all"
            >
              Switch Account
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30 flex items-center gap-1.5 transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Live Scientific Metabolic Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BMR (Mifflin)</span>
            <span className="text-lg font-black text-white">{Math.round(bmrEst)} kcal</span>
            <span className="text-[10px] text-slate-500 block">Basal metabolism at rest</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">TDEE Total Burn</span>
            <span className="text-lg font-black text-amber-400">{tdeeEst} kcal</span>
            <span className="text-[10px] text-slate-500 block">Maintenance with gym</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-emerald-500/30">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Target Daily Cals</span>
            <span className="text-lg font-black text-emerald-300">{previewCalories} kcal</span>
            <span className="text-[10px] text-slate-500 block">Based on {fitnessGoal.replace('_', ' ')}</span>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-2xl border border-blue-500/30">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Target Protein</span>
            <span className="text-lg font-black text-blue-300">{profile.target_macros.protein_g}g</span>
            <span className="text-[10px] text-slate-500 block">Muscle synthesis DRI</span>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Edit Form */}
      <form onSubmit={handleSave} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Scale className="w-4 h-4 text-emerald-400" />
          <span>Edit Physical Metrics & Goal Preferences</span>
        </h3>

        {/* Name & Age & Gender */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Friend Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Age (Years)</label>
            <input
              type="number"
              min="14"
              max="90"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Biological Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Height & Weight & Activity */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Height (cm)</label>
            <input
              type="number"
              min="100"
              max="240"
              value={heightCm}
              onChange={(e) => setHeightCm(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Weight (kg)</label>
            <input
              type="number"
              min="30"
              max="250"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Gym Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="sedentary">Sedentary (Little or no gym)</option>
              <option value="lightly_active">Lightly Active (1-3 days/wk)</option>
              <option value="moderately_active">Moderately Active (3-5 days/wk)</option>
              <option value="very_active">Very Active (6-7 days/wk gym)</option>
              <option value="extra_active">Extra Active (Athlete / 2x a day)</option>
            </select>
          </div>
        </div>

        {/* Goal & Diet Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Fitness Target Goal</label>
            <select
              value={fitnessGoal}
              onChange={(e) => setFitnessGoal(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="bulking">Bulking (Lean Muscle Gain + Caloric Surplus)</option>
              <option value="cutting">Cutting (Fat Loss Deficit + Muscle Protection)</option>
              <option value="overweight_loss">Overweight Safe Deficit (Joint & Knee Friendly)</option>
              <option value="maintenance">Maintenance (Maintain Current Body Composition)</option>
              <option value="recomposition">Body Recomposition (Simultaneous Fat Loss & Muscle)</option>
              <option value="athletic_performance">Athletic Performance & Conditioning</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Diet Style & Restriction</label>
            <select
              value={dietStyle}
              onChange={(e) => setDietStyle(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="high_protein">High-Protein Gym Diet</option>
              <option value="balanced">Balanced Whole Food Diet</option>
              <option value="vegetarian">Vegetarian High-Protein (Paneer, Dal, Soya, Whey)</option>
              <option value="vegan">Vegan 100% Plant-Based (Tofu, Soya, Legumes)</option>
              <option value="low_carb">Low-Carb Diet</option>
              <option value="keto">Ketogenic (Keto High-Fat)</option>
            </select>
          </div>
        </div>

        {/* Optional Custom Target Overrides */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Custom Calorie Override (Optional kcal)
            </label>
            <input
              type="number"
              placeholder="Leave blank for automatic calculation"
              value={customCalories}
              onChange={(e) => setCustomCalories(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Custom Protein Override (Optional grams)
            </label>
            <input
              type="number"
              placeholder="Leave blank for automatic calculation"
              value={customProtein}
              onChange={(e) => setCustomProtein(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
            />
          </div>
        </div>

        {/* Save CTA */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>{isSaving ? 'Recalculating & Saving...' : 'Save Diet Changes & Recalculate'}</span>
          </button>
        </div>
      </form>

    </div>
  );
};
