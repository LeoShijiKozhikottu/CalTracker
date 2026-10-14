import React from 'react';
import type { UserProfile, WindowTab } from '../types';
import {
  Dumbbell,
  Camera,
  Calendar,
  Users,
  Sparkles,
  User,
  Activity,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  profiles: UserProfile[];
  activeProfile: UserProfile | null;
  activeTab: WindowTab;
  onSelectTab: (tab: WindowTab) => void;
  onSelectProfile: (profile: UserProfile) => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profiles,
  activeProfile,
  activeTab,
  onSelectTab,
  onSelectProfile,
  onOpenAuth,
  onLogout,
  selectedDate,
  onDateChange
}) => {
  const tabs = [
    { id: 'dashboard' as WindowTab, label: "Today's Intake", icon: Activity },
    { id: 'scanner' as WindowTab, label: 'AI Food Scanner', icon: Camera, badge: 'AI' },
    { id: 'suggestions' as WindowTab, label: 'Meal Suggestions', icon: Sparkles },
    { id: 'exercises' as WindowTab, label: 'Gym Workouts', icon: Dumbbell },
    { id: 'friends' as WindowTab, label: 'Friends Compare', icon: Users },
    { id: 'profile' as WindowTab, label: 'Diet Profile', icon: User },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 transition-all">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/60">
        
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Dumbbell className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  Cal<span className="text-emerald-400">Tracker</span>
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-emerald-500/20">
                  GYM DIET
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Multi-Friend Calorie & Workout Tracker</p>
            </div>
          </div>

          {/* Mobile Fast Action */}
          <button
            type="button"
            onClick={() => onSelectTab('scanner')}
            className="md:hidden flex items-center gap-1 bg-emerald-500 text-slate-950 px-2.5 py-1.5 rounded-lg font-bold text-xs shadow-md shadow-emerald-500/20"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Scan Plate</span>
          </button>
        </div>

        {/* Controls: Date + Friend Switcher + Auth */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          
          {/* Date Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => onDateChange(e.target.value)}
              className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
            />
          </div>

          {/* Friend Profile Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 hidden sm:inline text-[11px]">Gym Friend:</span>
            <select
              value={activeProfile?.id || ''}
              onChange={(e) => {
                const found = profiles.find((p) => p.id === e.target.value);
                if (found) onSelectProfile(found);
              }}
              className="bg-transparent text-emerald-400 font-bold text-xs focus:outline-none cursor-pointer pr-1"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.fitness_goal.replace('_', ' ')} • {p.target_calories} kcal)
                </option>
              ))}
            </select>
          </div>

          {/* Auth Button & Logout */}
          {activeProfile ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenAuth}
                title="Switch gym buddy account"
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-all"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Accounts</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                title="Log out"
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-700 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-xl text-xs shadow-md shadow-emerald-500/20 transition-all"
            >
              <span>Sign In / Register</span>
            </button>
          )}

        </div>
      </div>

      {/* Multi-Window Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 sm:gap-2 py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] font-extrabold bg-emerald-500 text-slate-950 px-1 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
