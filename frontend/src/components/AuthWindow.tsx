import React, { useState } from 'react';
import { api } from '../api/client';
import type { UserProfile, FitnessGoal, ActivityLevel, DietStyle } from '../types';
import { Dumbbell, LogIn, UserPlus, Sparkles, AlertCircle } from 'lucide-react';

interface AuthWindowProps {
  onLoginSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
}

export const AuthWindow: React.FC<AuthWindowProps> = ({ onLoginSuccess, onCancel }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAge, setRegAge] = useState<number>(24);
  const [regGender, setRegGender] = useState<'male' | 'female'>('male');
  const [regHeight, setRegHeight] = useState<number>(175);
  const [regWeight, setRegWeight] = useState<number>(75);
  const [regActivity, setRegActivity] = useState<ActivityLevel>('moderately_active');
  const [regGoal, setRegGoal] = useState<FitnessGoal>('bulking');
  const [regDiet, setRegDiet] = useState<DietStyle>('high_protein');

  const demoAccounts = [
    {
      name: 'Rahul',
      email: 'rahul@gym.com',
      password: 'rahul123',
      badge: 'Bulking Goal',
      calories: '3,363 kcal',
      color: 'border-blue-500/40 hover:border-blue-400 bg-blue-500/5'
    },
    {
      name: 'Sneha',
      email: 'sneha@gym.com',
      password: 'sneha123',
      badge: 'Cutting / Fat Loss',
      calories: '1,684 kcal',
      color: 'border-emerald-500/40 hover:border-emerald-400 bg-emerald-500/5'
    },
    {
      name: 'Vikram',
      email: 'vikram@gym.com',
      password: 'vikram123',
      badge: 'Vegetarian Gymmer',
      calories: '3,120 kcal',
      color: 'border-amber-500/40 hover:border-amber-400 bg-amber-500/5'
    },
    {
      name: 'Priya',
      email: 'priya@gym.com',
      password: 'priya123',
      badge: 'Overweight Safe Fat Loss',
      calories: '1,850 kcal',
      color: 'border-purple-500/40 hover:border-purple-400 bg-purple-500/5'
    }
  ];

  const handleDemoLogin = async (demo: typeof demoAccounts[0]) => {
    setError(null);
    setLoading(true);
    try {
      const res = await api.login({ email: demo.email, password: demo.password });
      localStorage.setItem('caltracker_user', JSON.stringify(res.user));
      localStorage.setItem('caltracker_token', res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!loginEmail || !loginPassword) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login({ email: loginEmail, password: loginPassword });
      localStorage.setItem('caltracker_user', JSON.stringify(res.user));
      localStorage.setItem('caltracker_token', res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!regName || !regEmail || !regPassword) {
      setError('Please fill out all mandatory registration fields.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: regName,
        email: regEmail,
        password: regPassword,
        age: regAge,
        gender: regGender,
        height_cm: regHeight,
        weight_kg: regWeight,
        activity_level: regActivity,
        fitness_goal: regGoal,
        diet_style: regDiet
      };
      const res = await api.register(payload);
      localStorage.setItem('caltracker_user', JSON.stringify(res.user));
      localStorage.setItem('caltracker_token', res.access_token);
      onLoginSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2 sm:px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center max-w-lg mx-auto mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
            <Dumbbell className="w-8 h-8 stroke-[2.5]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">CalTracker</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Personalized gym nutrition, AI food scanning, and multi-user fitness progress tracking for you and your gym friends.
          </p>
        </div>

        {/* Quick Demo Friend Switcher Bar */}
        <div className="mb-8 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Instant Demo Logins (Click any gym buddy):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {demoAccounts.map((d) => (
              <button
                key={d.email}
                type="button"
                onClick={() => handleDemoLogin(d)}
                disabled={loading}
                className={`p-3 rounded-xl border text-left transition-all hover:scale-[1.02] active:scale-95 ${d.color}`}
              >
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{d.name}</span>
                  <span className="text-[10px] text-emerald-400">⚡</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{d.badge}</div>
                <div className="text-[10px] font-semibold text-slate-300 mt-1">{d.calories}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Toggle: Login vs Register */}
        <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800 max-w-sm mx-auto mb-6">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              !isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              isRegister ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="max-w-md mx-auto mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {!isRegister ? (
          <form onSubmit={handleLoginSubmit} className="max-w-sm mx-auto space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g., rahul@gym.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In to CalTracker'}
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegisterSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e.g. john@gym.com"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Create Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            {/* Body Parameters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Age</label>
                <input
                  type="number"
                  min="14"
                  max="80"
                  value={regAge}
                  onChange={(e) => setRegAge(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Gender</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Height (cm)</label>
                <input
                  type="number"
                  min="120"
                  max="230"
                  value={regHeight}
                  onChange={(e) => setRegHeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  min="35"
                  max="250"
                  value={regWeight}
                  onChange={(e) => setRegWeight(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Fitness Goal & Diet Style */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fitness Goal</label>
                <select
                  value={regGoal}
                  onChange={(e) => setRegGoal(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="bulking">Bulking (Muscle Gain)</option>
                  <option value="cutting">Cutting (Fat Loss)</option>
                  <option value="overweight_loss">Overweight Safe Deficit</option>
                  <option value="maintenance">Body Maintenance</option>
                  <option value="recomposition">Body Recomposition</option>
                  <option value="athletic_performance">Athletic Performance</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Diet Style</label>
                <select
                  value={regDiet}
                  onChange={(e) => setRegDiet(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="high_protein">High-Protein Gym Diet</option>
                  <option value="balanced">Balanced Macro Diet</option>
                  <option value="vegetarian">Vegetarian High-Protein</option>
                  <option value="vegan">100% Plant Vegan</option>
                  <option value="low_carb">Low-Carb Diet</option>
                  <option value="keto">Ketogenic (Keto)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Activity Level</label>
                <select
                  value={regActivity}
                  onChange={(e) => setRegActivity(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="sedentary">Sedentary (Desk Job)</option>
                  <option value="lightly_active">Lightly Active (1-3 days)</option>
                  <option value="moderately_active">Moderately Active (3-5 days)</option>
                  <option value="very_active">Very Active (6-7 days gym)</option>
                  <option value="extra_active">Extra Active (Athlete)</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Creating Your Plan...' : 'Create Account & Calculate Diet Targets'}
              </button>
            </div>
          </form>
        )}

        {onCancel && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              Continue without signing in
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
