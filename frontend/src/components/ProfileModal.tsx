import React, { useState, useEffect } from 'react';
import type { UserProfile, FitnessGoal, ActivityLevel, DietStyle } from '../types';
import { api } from '../api/client';
import { X, User, Activity, Target, Utensils, Check, Trash2 } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileToEdit?: UserProfile | null;
  onProfileSaved: (savedProfile: UserProfile) => void;
  onProfileDeleted?: (id: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profileToEdit,
  onProfileSaved,
  onProfileDeleted
}) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(24);
  const [gender, setGender] = useState('male');
  const [heightCm, setHeightCm] = useState(175);
  const [weightKg, setWeightKg] = useState(72);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately_active');
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('bulking');
  const [dietStyle, setDietStyle] = useState<DietStyle>('high_protein');
  const [customCalories, setCustomCalories] = useState<string>('');
  const [customProtein, setCustomProtein] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name);
      setAge(profileToEdit.age);
      setGender(profileToEdit.gender);
      setHeightCm(profileToEdit.height_cm);
      setWeightKg(profileToEdit.weight_kg);
      setActivityLevel(profileToEdit.activity_level);
      setFitnessGoal(profileToEdit.fitness_goal);
      setDietStyle(profileToEdit.diet_style);
      setCustomCalories(profileToEdit.target_calories ? String(profileToEdit.target_calories) : '');
      setCustomProtein(profileToEdit.target_macros?.protein_g ? String(profileToEdit.target_macros.protein_g) : '');
    } else {
      setName('');
      setAge(24);
      setGender('male');
      setHeightCm(175);
      setWeightKg(72);
      setActivityLevel('moderately_active');
      setFitnessGoal('bulking');
      setDietStyle('high_protein');
      setCustomCalories('');
      setCustomProtein('');
    }
  }, [profileToEdit, isOpen]);

  if (!isOpen) return null;

  // Live client-side calculation preview
  const previewBmr = gender === 'female'
    ? Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161)
    : Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);

  const actMultiplier = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extra_active: 1.9,
  }[activityLevel] || 1.55;

  const previewTdee = Math.round(previewBmr * actMultiplier);
  let estCals = previewTdee;
  if (fitnessGoal === 'bulking') estCals += 400;
  else if (fitnessGoal === 'cutting') estCals = Math.max(previewTdee - 450, 1200);

  const estProtein = Math.round(weightKg * (fitnessGoal === 'cutting' ? 2.2 : 2.0));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Please enter a friend name');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const payload: any = {
        name,
        age: Number(age),
        gender,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        activity_level: activityLevel,
        fitness_goal: fitnessGoal,
        diet_style: dietStyle,
        custom_calorie_target: customCalories ? Number(customCalories) : null,
        custom_protein_target: customProtein ? Number(customProtein) : null,
      };

      let saved: UserProfile;
      if (profileToEdit) {
        saved = await api.updateProfile(profileToEdit.id, payload);
      } else {
        saved = await api.createProfile(payload);
      }
      onProfileSaved(saved);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!profileToEdit || !onProfileDeleted) return;
    if (!window.confirm(`Are you sure you want to delete ${profileToEdit.name}'s profile?`)) return;
    try {
      await api.deleteProfile(profileToEdit.id);
      onProfileDeleted(profileToEdit.id);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {profileToEdit ? `Edit ${profileToEdit.name}'s Diet Plan` : 'Add Friend & Gym Goal'}
              </h2>
              <p className="text-xs text-slate-400">
                Personalized Mifflin-St Jeor TDEE & macro targets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Name & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Friend Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul, Sneha, Vikram"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Age, Height, Weight */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Age</label>
              <input
                type="number"
                min="14"
                max="100"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Height (cm)</label>
              <input
                type="number"
                min="100"
                max="240"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>Gym Fitness Goal</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'bulking', label: 'Bulking (Muscle Gain)' },
                { id: 'cutting', label: 'Cutting (Fat Loss)' },
                { id: 'maintenance', label: 'Maintenance' },
                { id: 'recomposition', label: 'Body Recomp' },
                { id: 'athletic_performance', label: 'Athletic Endur.' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setFitnessGoal(g.id as FitnessGoal)}
                  className={`p-2 text-xs font-bold rounded-xl border text-left transition-all ${
                    fitnessGoal === g.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Workout & Activity Frequency</span>
            </label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="sedentary">Sedentary (Little or no workout)</option>
              <option value="lightly_active">Lightly Active (Workout 1-3 days/week)</option>
              <option value="moderately_active">Moderately Active (Gym 3-5 days/week)</option>
              <option value="very_active">Very Active (Heavy Gym 6-7 days/week)</option>
              <option value="extra_active">Extra Active (Athlete / 2x training per day)</option>
            </select>
          </div>

          {/* Diet Style */}
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dietary Style & Preference</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'high_protein', label: 'High Protein' },
                { id: 'vegetarian', label: 'Vegetarian' },
                { id: 'vegan', label: 'Vegan' },
                { id: 'balanced', label: 'Balanced' },
                { id: 'low_carb', label: 'Low Carb' },
                { id: 'keto', label: 'Ketogenic' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDietStyle(d.id as DietStyle)}
                  className={`p-2 text-xs font-bold rounded-xl border text-center transition-all ${
                    dietStyle === d.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Real-time Calculation Summary Card */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Scientific Baseline</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">BMR</span>
                <span className="text-sm font-bold text-white">{previewBmr} kcal</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">TDEE</span>
                <span className="text-sm font-bold text-white">{previewTdee} kcal</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2 border border-emerald-500/30">
                <span className="text-[10px] text-emerald-400 block">Target Daily</span>
                <span className="text-sm font-black text-emerald-300">{estCals} kcal</span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2 border border-blue-500/30">
                <span className="text-[10px] text-blue-400 block">Daily Protein</span>
                <span className="text-sm font-black text-blue-300">~{estProtein}g</span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-2">
            {profileToEdit && onProfileDeleted ? (
              <button
                type="button"
                onClick={handleDelete}
                className="py-2.5 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold text-xs border border-red-500/30 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
