import { useState, useEffect } from 'react';
import { api } from './api/client';
import type { UserProfile, DailyIntakeSummary, WindowTab, MealType } from './types';
import { Navbar } from './components/Navbar';
import { DailyDashboard } from './components/DailyDashboard';
import { MealTimeline } from './components/MealTimeline';
import { FoodScannerWindow } from './components/FoodScannerWindow';
import { SmartMealSuggestionsWindow } from './components/SmartMealSuggestionsWindow';
import { GymExercisesWindow } from './components/GymExercisesWindow';
import { FriendsComparisonWindow } from './components/FriendsComparisonWindow';
import { ProfileSettingsWindow } from './components/ProfileSettingsWindow';
import { AuthWindow } from './components/AuthWindow';
import { Dumbbell, Plus } from 'lucide-react';

export function App() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<WindowTab>('dashboard');
  const [scannerSlot, setScannerSlot] = useState<MealType | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dailySummary, setDailySummary] = useState<DailyIntakeSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);

  // 1. Load profiles on startup and restore saved user
  const loadProfiles = async () => {
    try {
      const data = await api.getProfiles();
      setProfiles(data);

      const savedUserStr = localStorage.getItem('caltracker_user');
      if (savedUserStr) {
        try {
          const savedUser = JSON.parse(savedUserStr);
          const found = data.find((p) => p.id === savedUser.id);
          if (found) {
            setActiveProfile(found);
            return;
          }
        } catch {
          // invalid cache
        }
      }

      if (data.length > 0 && !activeProfile) {
        setActiveProfile(data[0]);
      } else if (activeProfile) {
        const updated = data.find((p) => p.id === activeProfile.id);
        if (updated) setActiveProfile(updated);
      }
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  // 2. Fetch daily summary when activeProfile or selectedDate changes
  const loadDailySummary = async () => {
    if (!activeProfile) return;
    try {
      const summary = await api.getDailySummary(activeProfile.id, selectedDate);
      setDailySummary(summary);
    } catch (err) {
      console.error('Failed to load daily summary:', err);
    }
  };

  useEffect(() => {
    if (activeProfile) {
      loadDailySummary();
    }
  }, [activeProfile?.id, selectedDate]);

  const handleLoginSuccess = (user: UserProfile) => {
    setActiveProfile(user);
    setIsAuthOpen(false);
    loadProfiles();
  };

  const handleLogout = () => {
    localStorage.removeItem('caltracker_user');
    localStorage.removeItem('caltracker_token');
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Navigation with Multi-Window Tabs */}
      <Navbar
        profiles={profiles}
        activeProfile={activeProfile}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectProfile={(p) => {
          setActiveProfile(p);
          localStorage.setItem('caltracker_user', JSON.stringify(p));
        }}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        selectedDate={selectedDate}
        onDateChange={(d) => setSelectedDate(d)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        
        {/* If Profiles are Loading */}
        {isLoading && !activeProfile ? (
          <div className="text-center py-24 text-slate-400 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading gym diet profiles...</p>
          </div>
        ) : isAuthOpen ? (
          <AuthWindow
            onLoginSuccess={handleLoginSuccess}
            onCancel={activeProfile ? () => setIsAuthOpen(false) : undefined}
          />
        ) : !activeProfile ? (
          /* If no profiles exist */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-2xl space-y-4 my-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mx-auto">
              <Dumbbell className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Welcome to CalTracker</h2>
            <p className="text-xs text-slate-400">
              Set up your profile or sign in as one of your gym friends to view personalized calorie & macronutrient targets.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Sign In / Demo Login</span>
            </button>
          </div>
        ) : (
          /* Multi-Window Views (No Overcrowding!) */
          <div className="animate-fadeIn">
            
            {/* WINDOW 1: Today's Intake Dashboard */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <DailyDashboard summary={dailySummary} profile={activeProfile} />
                <MealTimeline
                  meals={dailySummary?.meals || []}
                  onOpenScanner={(slot) => {
                    setScannerSlot(slot);
                    setActiveTab('scanner');
                  }}
                  onMealDeleted={loadDailySummary}
                />
              </div>
            )}

            {/* WINDOW 2: AI Food Scanner & Camera */}
            {activeTab === 'scanner' && (
              <FoodScannerWindow
                user={activeProfile}
                selectedDate={selectedDate}
                initialMealType={scannerSlot}
                onMealLogged={() => {
                  loadDailySummary();
                }}
              />
            )}

            {/* WINDOW 3: Smart Meal Suggestions */}
            {activeTab === 'suggestions' && (
              <SmartMealSuggestionsWindow
                user={activeProfile}
                selectedDate={selectedDate}
                onMealLogged={loadDailySummary}
                onOpenScanner={() => {
                  setScannerSlot('lunch');
                  setActiveTab('scanner');
                }}
              />
            )}

            {/* WINDOW 4: Gym Exercises & Workouts */}
            {activeTab === 'exercises' && (
              <GymExercisesWindow
                user={activeProfile}
                selectedDate={selectedDate}
                onWorkoutLogged={loadDailySummary}
              />
            )}

            {/* WINDOW 5: Gym Friends Progress Comparison */}
            {activeTab === 'friends' && (
              <FriendsComparisonWindow
                activeProfile={activeProfile}
                selectedDate={selectedDate}
                onSelectFriend={(f) => {
                  setActiveProfile(f);
                  localStorage.setItem('caltracker_user', JSON.stringify(f));
                  setActiveTab('dashboard');
                }}
                allProfiles={profiles}
              />
            )}

            {/* WINDOW 6: My Diet & Profile */}
            {activeTab === 'profile' && (
              <ProfileSettingsWindow
                profile={activeProfile}
                onProfileUpdated={(updated) => {
                  setActiveProfile(updated);
                  localStorage.setItem('caltracker_user', JSON.stringify(updated));
                  loadProfiles();
                }}
                onLogout={handleLogout}
                onSwitchAccount={() => setIsAuthOpen(true)}
              />
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">CalTracker</span>
            <span>• Personalized Gym Nutrition, AI Vision & Exercise Planner</span>
          </div>
          <p className="text-[11px] text-slate-400">
            FastAPI Backend • React 19 Frontend • Google Gemini Vision AI
          </p>
        </div>
      </footer>

    </div>
  );
}

export default App;
