import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ExerciseItem, ExerciseCategory, ExerciseLog, UserProfile } from '../types';
import { Dumbbell, Flame, Zap, Shield, Plus, Search, CheckCircle2, Trash2, Info } from 'lucide-react';
import confetti from 'canvas-confetti';

interface GymExercisesWindowProps {
  user: UserProfile;
  selectedDate: string;
  onWorkoutLogged?: () => void;
}

export const GymExercisesWindow: React.FC<GymExercisesWindowProps> = ({
  user,
  selectedDate,
  onWorkoutLogged
}) => {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Today's logged workouts
  const [loggedWorkouts, setLoggedWorkouts] = useState<ExerciseLog[]>([]);

  // Logging modal state
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [sets, setSets] = useState<number>(3);
  const [reps, setReps] = useState<number>(12);
  const [weightKg, setWeightKg] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exercises
  useEffect(() => {
    const fetchExercises = async () => {
      setLoading(true);
      try {
        const cat = activeCategory === 'all' ? undefined : activeCategory;
        const data = await api.getExercises(cat);
        setExercises(data);
      } catch (err) {
        console.error('Failed to load exercises:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExercises();
  }, [activeCategory]);

  // Fetch user's workout logs for today
  const loadDailyWorkouts = async () => {
    try {
      const logs = await api.getDailyWorkouts(user.id, selectedDate);
      setLoggedWorkouts(logs);
    } catch (err) {
      console.error('Failed to load workout logs:', err);
    }
  };

  useEffect(() => {
    loadDailyWorkouts();
  }, [user.id, selectedDate]);

  // Filter exercises
  const filteredExercises = exercises.filter((ex) => {
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.target_muscles.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  // Calculate dynamic calories burned based on exercise rate
  const calculatedBurn = selectedExercise
    ? Math.round((selectedExercise.calories_per_20min / 20) * durationMinutes)
    : 150;

  const handleOpenLogModal = (ex: ExerciseItem) => {
    setSelectedExercise(ex);
    setDurationMinutes(20);
    setSets(3);
    setReps(12);
    setWeightKg(0);
    setNotes('');
  };

  const handleSaveWorkout = async () => {
    if (!selectedExercise) return;
    setIsSubmitting(true);
    try {
      await api.logExercise({
        userId: user.id,
        exerciseId: selectedExercise.id,
        exerciseName: selectedExercise.name,
        date: selectedDate,
        durationMinutes,
        sets,
        reps,
        weightKg,
        caloriesBurned: calculatedBurn,
        notes
      });
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
      setSelectedExercise(null);
      await loadDailyWorkouts();
      if (onWorkoutLogged) onWorkoutLogged();
    } catch (err) {
      console.error('Failed to log exercise:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkout = async (logId: string) => {
    try {
      await api.deleteWorkoutLog(logId);
      await loadDailyWorkouts();
      if (onWorkoutLogged) onWorkoutLogged();
    } catch (err) {
      console.error('Failed to delete workout:', err);
    }
  };

  const totalCaloriesBurnedToday = loggedWorkouts.reduce((acc, curr) => acc + curr.calories_burned, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Dumbbell className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Gym Exercises & Training Routines</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Targeted routines designed for your exact body goal: joint-safe movements for overweight individuals, high-energy fat shredders for weight loss, and heavy compound lifts for lean muscle bulking.
            </p>
          </div>

          {/* Today's Burned Summary Pill */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-3.5 sm:px-5 text-right flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">Today's Gym Burn</span>
            <span className="text-2xl font-black text-white flex items-center justify-end gap-1.5">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>{Math.round(totalCaloriesBurnedToday)} <span className="text-xs font-semibold text-slate-400">kcal</span></span>
            </span>
            <span className="text-[11px] text-slate-400">{loggedWorkouts.length} exercises completed today</span>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-6 mt-2 border-t border-slate-800/80">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeCategory === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Workouts ({exercises.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('overweight')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCategory === 'overweight'
                ? 'bg-purple-500 text-white shadow-md shadow-purple-500/20'
                : 'bg-slate-800/80 text-purple-300 hover:bg-slate-700 border border-purple-500/20'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            <span>Overweight / Joint-Safe (Knee & Spine Safe)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('weight_loss')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCategory === 'weight_loss'
                ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                : 'bg-slate-800/80 text-red-300 hover:bg-slate-700 border border-red-500/20'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>Weight Loss / Fat Burn (HIIT)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('muscle_gain')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCategory === 'muscle_gain'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-800/80 text-blue-300 hover:bg-slate-700 border border-blue-500/20'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5 text-blue-400" />
            <span>Muscle Gain & Bulking (Hypertrophy)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('athletic')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeCategory === 'athletic'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800/80 text-emerald-300 hover:bg-slate-700 border border-emerald-500/20'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Athletic & Core</span>
          </button>
        </div>
      </div>

      {/* Today's Logged Activity Strip (if any) */}
      {loggedWorkouts.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Today's Logged Workouts ({loggedWorkouts.length})</span>
            </span>
            <span className="text-xs text-slate-400">Date: {selectedDate}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {loggedWorkouts.map((w) => (
              <div key={w.id} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between group">
                <div>
                  <h4 className="text-xs font-bold text-white">{w.exercise_name}</h4>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>⏱ {w.duration_minutes} mins</span>
                    {w.sets && <span>• {w.sets} sets × {w.reps} reps</span>}
                    {w.weight_kg ? <span>• {w.weight_kg}kg</span> : null}
                  </div>
                  <span className="text-[10px] font-bold text-amber-400 mt-1 inline-block">
                    🔥 -{w.calories_burned} kcal burned
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteWorkout(w.id)}
                  title="Remove workout"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-80 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 max-w-md">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by exercise name, muscle (e.g. Glutes, Chest), equipment..."
          className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full"
        />
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">Loading exercise library...</div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 text-xs">
          No exercises found matching your search. Try adjusting filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((ex) => {
            const isOverweightCategory = ex.category === 'overweight';
            const isWeightLoss = ex.category === 'weight_loss';
            const isMuscleGain = ex.category === 'muscle_gain';

            return (
              <div
                key={ex.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl group"
              >
                <div>
                  {/* Category Pill + Calories burned per 20m */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isOverweightCategory
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : isWeightLoss
                          ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                          : isMuscleGain
                          ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {ex.category.replace('_', ' ')}
                    </span>

                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>~{ex.calories_per_20min} kcal / 20 min</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                    {ex.name}
                  </h3>

                  {/* Target Muscles */}
                  <div className="flex flex-wrap gap-1.5 my-2.5">
                    {ex.target_muscles.map((muscle) => (
                      <span key={muscle} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                        {muscle}
                      </span>
                    ))}
                  </div>

                  {/* Sets & Reps Guidance */}
                  <div className="text-xs text-slate-300 bg-slate-950/60 rounded-xl p-2.5 border border-slate-800/80 my-2">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Recommended Plan:</span>
                    <span className="font-semibold text-emerald-400">{ex.recommended_sets_reps}</span>
                    <div className="text-[11px] text-slate-400 mt-0.5">Equipment: {ex.equipment} • {ex.difficulty}</div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-400 leading-relaxed mt-2">{ex.description}</p>

                  {/* Safety & Form Tip */}
                  <div className="mt-3 p-2.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-xs text-blue-300">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-400 mb-0.5">
                      <Info className="w-3 h-3" />
                      <span>Joint Safety & Form Tip:</span>
                    </div>
                    <p className="text-[11px] text-slate-300">{ex.safety_and_form_tip}</p>
                  </div>
                </div>

                {/* Log Button */}
                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleOpenLogModal(ex)}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Log Workout ({user.name.split(' ')[0]})</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* LOG WORKOUT MODAL */}
      {selectedExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-amber-400">Log Gym Exercise</span>
                <h3 className="text-lg font-bold text-white">{selectedExercise.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (Minutes)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="5"
                    max="90"
                    step="5"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-white bg-slate-800 px-2.5 py-1 rounded-lg">
                    {durationMinutes} mins
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sets</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={sets}
                    onChange={(e) => setSets(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Reps</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={reps}
                    onChange={(e) => setReps(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Notes / Feedback</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Felt strong on last 2 sets"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600"
                />
              </div>

              {/* Calculated Burn Output */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs text-amber-300 font-semibold">Estimated Calories Burned:</span>
                <span className="text-lg font-black text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-amber-400" />
                  <span>{calculatedBurn} kcal</span>
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedExercise(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveWorkout}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20"
              >
                {isSubmitting ? 'Saving...' : 'Confirm & Log Burn'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
