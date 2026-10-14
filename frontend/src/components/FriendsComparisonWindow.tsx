import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { FriendComparisonItem, UserProfile } from '../types';
import { Users, Award, Flame, ArrowRight, Sparkles } from 'lucide-react';

interface FriendsComparisonWindowProps {
  activeProfile: UserProfile;
  selectedDate: string;
  onSelectFriend: (user: UserProfile) => void;
  allProfiles: UserProfile[];
}

export const FriendsComparisonWindow: React.FC<FriendsComparisonWindowProps> = ({
  activeProfile,
  selectedDate,
  onSelectFriend,
  allProfiles
}) => {
  const [friendsData, setFriendsData] = useState<FriendComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Head-to-head state
  const [friend1Id, setFriend1Id] = useState<string>(activeProfile.id);
  const [friend2Id, setFriend2Id] = useState<string>('');
  const [comparisonDetail, setComparisonDetail] = useState<any>(null);
  const [comparing, setComparing] = useState(false);

  const loadFriends = async () => {
    setLoading(true);
    try {
      const data = await api.getFriendsProgress(selectedDate);
      setFriendsData(data);
      if (data.length > 1 && !friend2Id) {
        const other = data.find((d: FriendComparisonItem) => d.user_id !== activeProfile.id);
        if (other) setFriend2Id(other.user_id);
      }
    } catch (err) {
      console.error('Failed to load friends progress:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFriends();
  }, [selectedDate, activeProfile.id]);

  useEffect(() => {
    const fetchHeadToHead = async () => {
      if (!friend1Id || !friend2Id || friend1Id === friend2Id) return;
      setComparing(true);
      try {
        const data = await api.compareFriends(friend1Id, friend2Id, selectedDate);
        setComparisonDetail(data);
      } catch (err) {
        console.error('Failed to compare friends:', err);
      } finally {
        setComparing(false);
      }
    };
    fetchHeadToHead();
  }, [friend1Id, friend2Id, selectedDate]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Gym Buddies & Progress Comparison</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Track and compare dietary adherence, protein intake, and calories burned with your gym friends. Each person has a unique personalized target (Bulking, Cutting, Overweight Safe Deficit, or Vegetarian).
            </p>
          </div>

          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4 text-right flex-shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block">Total Active Gym Buddies</span>
            <span className="text-2xl font-black text-white flex items-center justify-end gap-1.5">
              <span>{friendsData.length} Friends</span>
            </span>
            <span className="text-[11px] text-slate-400">Tracking date: {selectedDate}</span>
          </div>
        </div>
      </div>

      {/* Friends Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Today's Multi-Diet Standings</span>
          </h3>
          <span className="text-xs text-slate-400">Click "Switch to View" to examine any friend's diet</span>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-400">Loading friends progress...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendsData.map((f) => {
              const isCurrent = f.user_id === activeProfile.id;

              return (
                <div
                  key={f.user_id}
                  className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all hover:shadow-xl relative overflow-hidden ${
                    isCurrent ? 'border-emerald-500/50 shadow-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {isCurrent && (
                    <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-bl-xl shadow-sm">
                      Active Account
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                          <span>{f.name}</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 capitalize">
                          {f.fitness_goal.replace('_', ' ')} • {f.diet_style.replace('_', ' ')}
                        </p>
                      </div>

                      <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700">
                        {f.status_badge}
                      </span>
                    </div>

                    {/* Streak & Burn info */}
                    <div className="flex items-center gap-2 my-3 text-xs bg-slate-950/60 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{f.streak_days} Day Streak</span>
                      </span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-medium">
                        🔥 -{f.calories_burned_today} kcal burned
                      </span>
                    </div>

                    {/* Calorie Progress Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Calories:</span>
                        <span className="font-bold text-white">
                          {f.consumed_calories} <span className="text-slate-400 font-normal">/ {f.target_calories} kcal</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(f.calorie_progress_pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">{f.calorie_progress_pct}% reached</div>
                    </div>

                    {/* Protein Progress Bar */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-medium">Protein:</span>
                        <span className="font-bold text-blue-400">
                          {f.consumed_protein}g <span className="text-slate-400 font-normal">/ {f.target_protein}g</span>
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(f.protein_progress_pct, 100)}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400 text-right">{f.protein_progress_pct}% protein goal</div>
                    </div>
                  </div>

                  {/* Switch to this profile button */}
                  <div className="pt-3 mt-3 border-t border-slate-800/80">
                    <button
                      type="button"
                      onClick={() => {
                        const found = allProfiles.find((p) => p.id === f.user_id);
                        if (found) onSelectFriend(found);
                      }}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isCurrent
                          ? 'bg-slate-800 text-slate-400 cursor-default'
                          : 'bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      <span>{isCurrent ? 'Viewing Current Account' : `Switch to View ${f.name}`}</span>
                      {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Head-to-Head Gym Buddy Duel Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <span>Head-to-Head Gym Buddy Duel</span>
            </h3>
            <p className="text-xs text-slate-400">Select any two friends to see a side-by-side comparison of today's discipline</p>
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-3">
            <select
              value={friend1Id}
              onChange={(e) => setFriend1Id(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none"
            >
              {friendsData.map((f) => (
                <option key={f.user_id} value={f.user_id}>
                  {f.name}
                </option>
              ))}
            </select>

            <span className="text-xs font-extrabold text-slate-500">VS</span>

            <select
              value={friend2Id}
              onChange={(e) => setFriend2Id(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-indigo-400 font-bold focus:outline-none"
            >
              {friendsData.map((f) => (
                <option key={f.user_id} value={f.user_id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Duel Comparison Table */}
        {comparing ? (
          <div className="text-center py-8 text-slate-400 text-xs">Comparing friend stats...</div>
        ) : comparisonDetail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Friend 1 Card */}
            <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Gym Buddy #1</span>
                  <h4 className="text-base font-extrabold text-white">{comparisonDetail.friend_1.profile.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">
                    {comparisonDetail.friend_1.profile.fitness_goal.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block">Target Cals</span>
                  <span className="text-sm font-bold text-white">{comparisonDetail.friend_1.profile.target_calories} kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Consumed</span>
                  <span className="text-xs font-bold text-white">{comparisonDetail.friend_1.consumed_calories} kcal</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Protein</span>
                  <span className="text-xs font-bold text-blue-400">{comparisonDetail.friend_1.consumed_protein}g</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Gym Burned</span>
                  <span className="text-xs font-bold text-amber-400">-{comparisonDetail.friend_1.calories_burned} kcal</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Added Sugar</span>
                  <span className="text-xs font-bold text-slate-300">{comparisonDetail.friend_1.consumed_sugar}g</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span>Net Calories (Intake - Burn):</span>
                  <span className="font-extrabold text-emerald-300">{comparisonDetail.friend_1.net_calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Friend 2 Card */}
            <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-indigo-400">Gym Buddy #2</span>
                  <h4 className="text-base font-extrabold text-white">{comparisonDetail.friend_2.profile.name}</h4>
                  <p className="text-xs text-slate-400 capitalize">
                    {comparisonDetail.friend_2.profile.fitness_goal.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-slate-400 block">Target Cals</span>
                  <span className="text-sm font-bold text-white">{comparisonDetail.friend_2.profile.target_calories} kcal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Consumed</span>
                  <span className="text-xs font-bold text-white">{comparisonDetail.friend_2.consumed_calories} kcal</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Protein</span>
                  <span className="text-xs font-bold text-blue-400">{comparisonDetail.friend_2.consumed_protein}g</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Gym Burned</span>
                  <span className="text-xs font-bold text-amber-400">-{comparisonDetail.friend_2.calories_burned} kcal</span>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl">
                  <span className="text-[10px] text-slate-400 block">Added Sugar</span>
                  <span className="text-xs font-bold text-slate-300">{comparisonDetail.friend_2.consumed_sugar}g</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center">
                  <span>Net Calories (Intake - Burn):</span>
                  <span className="font-extrabold text-indigo-300">{comparisonDetail.friend_2.net_calories} kcal</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="text-center py-6 text-slate-500 text-xs">
            Pick two distinct friends above to view the duel comparison.
          </div>
        )}
      </div>

    </div>
  );
};
