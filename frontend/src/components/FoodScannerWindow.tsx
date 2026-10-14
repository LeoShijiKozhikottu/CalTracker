import React, { useState, useRef, useEffect } from 'react';
import { api } from '../api/client';
import type { FoodItem, MealType, UserProfile } from '../types';
import {
  Camera,
  Upload,
  Sparkles,
  Check,
  Trash2,
  AlertCircle,
  RefreshCw,
  Utensils,
  Video,
  VideoOff,
  Plus,
  Minus,
  CheckCircle2,
  Flame,
  Key,
  X,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FoodScannerWindowProps {
  user: UserProfile;
  selectedDate: string;
  onMealLogged: () => void;
  initialMealType?: MealType;
}

export const FoodScannerWindow: React.FC<FoodScannerWindowProps> = ({
  user,
  selectedDate,
  onMealLogged,
  initialMealType
}) => {
  const getInitialMealType = (): MealType => {
    if (initialMealType) return initialMealType;
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 19) return 'snack';
    return 'dinner';
  };

  const getInitialDishHint = (): string => {
    const hour = new Date().getHours();
    if (hour >= 11 && hour < 16) return 'Chicken Biryani with Raita';
    if (hour >= 16 && hour < 19) return 'Protein Shake with Banana';
    if (hour >= 19 || hour < 6) return 'Paneer Bhurji with Roti';
    return 'Dosa and Sambar';
  };

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState<string>(getInitialDishHint);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    items: FoodItem[];
    fitness_insight: string;
    image_url: string;
    is_live_ai?: boolean;
  } | null>(null);
  const [mealType, setMealType] = useState<MealType>(getInitialMealType);

  // Gemini Vision API Key state
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false);
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isSavingKey, setIsSavingKey] = useState<boolean>(false);

  useEffect(() => {
    api.getVisionStatus().then((st) => setGeminiConfigured(st.gemini_api_configured));
  }, []);

  const handleSaveApiKey = async () => {
    if (!apiKeyInput.trim()) return;
    setIsSavingKey(true);
    setErrorMsg(null);
    try {
      await api.setGeminiApiKey(apiKeyInput.trim());
      setGeminiConfigured(true);
      setShowApiKeyModal(false);
      setSuccessMsg("Google Gemini Vision API key activated! Your scans will now use real-time computer vision AI.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to set Gemini API key");
    } finally {
      setIsSavingKey(false);
    }
  };

  useEffect(() => {
    if (initialMealType) {
      setMealType(initialMealType);
    }
  }, [initialMealType]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preloaded Demo Example Plates (Including user's Chappathi & Chicken Curry and Fresh Red Apple)
  const examplePlates = [
    {
      title: 'Chappathi & Chicken Curry',
      subtitle: '2 Whole Wheat Rotis + Chicken Curry (38g Protein)',
      hint: 'Chappathi and Chicken Curry',
      defaultMeal: 'dinner' as MealType,
      mealBadge: '🌙 Dinner',
      gradient: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-300',
      emoji: '🫓'
    },
    {
      title: 'Fresh Red Apple',
      subtitle: '1 Medium Apple • 95 kcal • 4.4g Fiber',
      hint: 'Fresh Red Apple',
      defaultMeal: 'snack' as MealType,
      mealBadge: '🥪 Snack',
      gradient: 'from-rose-500/20 to-red-500/20 border-red-500/30 text-red-300',
      emoji: '🍎'
    },
    {
      title: 'Chicken Biryani & Raita',
      subtitle: 'Dum Biryani + Curd Raita + Boiled Egg (45g Protein)',
      hint: 'Chicken Biryani with Raita and Boiled Egg',
      defaultMeal: 'lunch' as MealType,
      mealBadge: '☀️ Lunch',
      gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
      emoji: '🍗'
    },
    {
      title: 'Dosa & Sambar',
      subtitle: '2 Crispy Dosas + Lentil Sambar + Chutney',
      hint: 'Dosa and Sambar',
      defaultMeal: 'breakfast' as MealType,
      mealBadge: '🌅 Breakfast',
      gradient: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300',
      emoji: '🥞'
    },
    {
      title: 'Grilled Chicken & Rice',
      subtitle: 'Lean Chicken Breast + Brown Rice + Broccoli',
      hint: 'Grilled Chicken Breast with Brown Rice and Broccoli',
      defaultMeal: 'lunch' as MealType,
      mealBadge: '☀️ Lunch',
      gradient: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300',
      emoji: '🥗'
    },
    {
      title: 'Paneer Roti & Dal',
      subtitle: 'High-Protein Paneer Bhurji + Roti + Yellow Dal',
      hint: 'Paneer Bhurji with Whole Wheat Roti and Dal Tadka',
      defaultMeal: 'dinner' as MealType,
      mealBadge: '🌙 Dinner',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
      emoji: '🧀'
    }
  ];

  // Stop camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      setErrorMsg('Could not access camera. Please check camera permissions or upload an image.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          setPreviewUrl(canvas.toDataURL('image/jpeg'));
          stopCamera();
        }
      }, 'image/jpeg');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
      setAnalysisResult(null);
      setSuccessMsg(null);

      const fileNameLower = file.name.toLowerCase();
      if (fileNameLower.includes('biri') || fileNameLower.includes('biryani')) {
        setDishHint('Chicken Biryani with Raita');
        setMealType('lunch');
      } else if (fileNameLower.includes('apple') || fileNameLower.includes('fruit')) {
        setDishHint('Fresh Red Apple');
        setMealType('snack');
      } else if (fileNameLower.includes('chap') || fileNameLower.includes('roti') || fileNameLower.includes('curry')) {
        setDishHint('Chappathi and Chicken Curry');
        setMealType('dinner');
      }
    }
  };

  const handleDishHintChange = (val: string) => {
    setDishHint(val);
    const lower = val.toLowerCase();
    if (lower.includes('biri') || lower.includes('biryani')) {
      setMealType('lunch');
    } else if (lower.includes('apple') || lower.includes('fruit')) {
      setMealType('snack');
    } else if (lower.includes('curry') || lower.includes('roti') || lower.includes('chap')) {
      setMealType('dinner');
    }
  };

  const handleSelectExample = (plate: typeof examplePlates[0]) => {
    setDishHint(plate.hint);
    if (plate.defaultMeal) {
      setMealType(plate.defaultMeal);
    }
    setSelectedFile(null);
    // Draw synthetic preview card
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 600, 400);
      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText(plate.title, 50, 160);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '20px sans-serif';
      ctx.fillText(plate.subtitle, 50, 220);
      ctx.font = '64px sans-serif';
      ctx.fillText(plate.emoji, 480, 200);
    }
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `${plate.hint.toLowerCase().replace(/\s+/g, '_')}.jpg`, { type: 'image/jpeg' });
        setSelectedFile(file);
        setPreviewUrl(canvas.toDataURL('image/jpeg'));
      }
    }, 'image/jpeg');
    setAnalysisResult(null);
    setSuccessMsg(null);
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      let fileToSend = selectedFile;
      if (!fileToSend) {
        const canvas = document.createElement('canvas');
        canvas.width = 400;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(0, 0, 400, 300);
          ctx.fillStyle = '#10b981';
          ctx.font = '20px sans-serif';
          ctx.fillText(dishHint || 'Delicious Food Plate', 40, 150);
        }
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b || new Blob()), 'image/jpeg'));
        fileToSend = new File([blob], 'food_plate.jpg', { type: 'image/jpeg' });
        setPreviewUrl(canvas.toDataURL());
      }

      const res = await api.analyzeFoodImage(fileToSend, dishHint);
      setAnalysisResult({
        items: res.items,
        fitness_insight: res.fitness_insight,
        image_url: res.image_url,
        is_live_ai: res.is_live_ai
      });
      if (res.gemini_api_configured) {
        setGeminiConfigured(true);
      }
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze food plate.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!analysisResult || analysisResult.items.length === 0) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await api.logMeal({
        userId: user.id,
        mealType,
        date: selectedDate,
        items: analysisResult.items,
        imageUrl: analysisResult.image_url,
        notes: analysisResult.fitness_insight
      });
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.7 } });
      setSuccessMsg(`Successfully logged meal to ${mealType.toUpperCase()}!`);
      onMealLogged();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save meal.');
    } finally {
      setIsSaving(false);
    }
  };

  const updateItemPortion = (idx: number, multiplier: number) => {
    if (!analysisResult) return;
    const newItems = [...analysisResult.items];
    const item = { ...newItems[idx] };
    item.calories = Math.round(item.calories * multiplier);
    item.macros = {
      protein_g: Math.round(item.macros.protein_g * multiplier * 10) / 10,
      carbs_g: Math.round(item.macros.carbs_g * multiplier * 10) / 10,
      fats_g: Math.round(item.macros.fats_g * multiplier * 10) / 10
    };
    item.micros = {
      ...item.micros,
      sugar_g: Math.round(item.micros.sugar_g * multiplier * 10) / 10,
      cholesterol_mg: Math.round(item.micros.cholesterol_mg * multiplier * 10) / 10
    };
    newItems[idx] = item;
    setAnalysisResult({ ...analysisResult, items: newItems });
  };

  const removeItem = (idx: number) => {
    if (!analysisResult) return;
    const newItems = analysisResult.items.filter((_, i) => i !== idx);
    setAnalysisResult({ ...analysisResult, items: newItems });
  };

  const totalCalories = analysisResult?.items.reduce((acc, i) => acc + i.calories, 0) || 0;
  const totalProtein = analysisResult?.items.reduce((acc, i) => acc + i.macros.protein_g, 0) || 0;
  const totalCarbs = analysisResult?.items.reduce((acc, i) => acc + i.macros.carbs_g, 0) || 0;
  const totalFats = analysisResult?.items.reduce((acc, i) => acc + i.macros.fats_g, 0) || 0;
  const totalSugar = analysisResult?.items.reduce((acc, i) => acc + i.micros.sugar_g, 0) || 0;
  const totalCholesterol = analysisResult?.items.reduce((acc, i) => acc + i.micros.cholesterol_mg, 0) || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Camera className="w-5 h-5 stroke-[2.5]" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">AI Food Plate & Calorie Scanner</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              Snap a picture via device camera, upload from gallery, or select any pre-loaded meal below. Our vision AI breaks down calories, macros, sugar, cholesterol, and essential vitamins in seconds!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Gemini Vision AI Status Pill */}
            <div className={`border rounded-2xl p-3.5 flex items-center justify-between gap-3 ${
              geminiConfigured
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
            }`}>
              <div className="text-left">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider">
                  <span className={`w-2 h-2 rounded-full ${geminiConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  <span>{geminiConfigured ? 'Live Vision AI Active' : 'Smart Offline Matcher'}</span>
                </div>
                <div className="text-[11px] text-slate-300 font-medium">
                  {geminiConfigured ? 'Google Gemini 2.5/2.0' : 'No API key detected'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(true)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                  geminiConfigured
                    ? 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800'
                    : 'bg-amber-500 text-slate-950 border-amber-400 hover:bg-amber-400 shadow-sm'
                }`}
              >
                <Key className="w-3 h-3" />
                <span>{geminiConfigured ? 'Key' : 'Connect Key'}</span>
              </button>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-right">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Logging User</span>
              <span className="text-base font-extrabold text-emerald-400">{user.name}</span>
              <span className="text-[11px] text-slate-400 block capitalize">{user.fitness_goal.replace('_', ' ')} • {user.target_calories} kcal target</span>
            </div>
          </div>
        </div>

        {/* 1-Click Example Demo Plates */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Try Instant Example Meals (1-Click Test):</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {examplePlates.map((plate) => (
              <button
                key={plate.title}
                type="button"
                onClick={() => handleSelectExample(plate)}
                className={`p-3 rounded-2xl border text-left bg-slate-950/60 hover:bg-slate-900 transition-all hover:scale-[1.02] active:scale-95 flex flex-col justify-between ${plate.gradient}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{plate.emoji}</span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-900/80 border border-white/10 text-white">
                      {plate.mealBadge}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">{plate.title}</div>
                  <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{plate.subtitle}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Image Capture & Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              <span>Capture or Upload Food Plate</span>
            </h3>

            {/* Live Camera View OR Image Preview OR Empty Box */}
            <div className="w-full aspect-video sm:aspect-square max-h-80 bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl flex items-center justify-center overflow-hidden relative group">
              {isCameraActive ? (
                <div className="relative w-full h-full">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={captureCameraSnapshot}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 active:scale-95"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-xl flex items-center gap-1"
                    >
                      <VideoOff className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : previewUrl ? (
                <div className="relative w-full h-full">
                  <img
                    src={previewUrl}
                    alt="Food Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-slate-400 hover:text-white backdrop-blur-sm"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="text-center p-6 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 mx-auto">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-semibold text-slate-300">Take a photo or upload from gallery</p>
                  <p className="text-[11px] text-slate-500">Supports JPG, PNG, WEBP from your phone or PC</p>
                </div>
              )}
            </div>

            {/* Action Buttons: Camera & Upload */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={isCameraActive ? stopCamera : startCamera}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <Video className="w-4 h-4 text-emerald-400" />
                <span>{isCameraActive ? 'Stop Camera' : 'Use Camera'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
              >
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Upload File</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Meal Slot Timing Selector */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Meal Slot Timing</span>
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {mealType}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'breakfast', label: 'Breakfast', icon: '🌅' },
                  { id: 'lunch', label: 'Lunch', icon: '☀️' },
                  { id: 'snack', label: 'Snack', icon: '🥪' },
                  { id: 'dinner', label: 'Dinner', icon: '🌙' },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMealType(m.id as MealType)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-0.5 border transition-all ${
                      mealType === m.id
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black scale-[1.02]'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm">{m.icon}</span>
                    <span className="text-[10px] font-bold">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Dish Hint Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Dish Name / Hint (Helps AI precision)
              </label>
              <input
                type="text"
                value={dishHint}
                onChange={(e) => handleDishHintChange(e.target.value)}
                placeholder="e.g., Chicken Biryani, Dosa & Sambar, Oats..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Analyze Button */}
            <button
              type="button"
              onClick={handleStartAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Scanning Nutritional Profile...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 stroke-[2.5]" />
                  <span>Scan Plate & Calculate Calories</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Analysis Results & Logging (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {analysisResult ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              
              {/* Total Macros & Calories Card */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                        {analysisResult.is_live_ai ? '✨ Live Gemini Vision AI' : '⚡ Smart Component Match'}
                      </span>
                      {analysisResult.is_live_ai && (
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-extrabold px-1.5 py-0.5 rounded border border-emerald-500/30">
                          LIVE
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white flex items-center gap-2">
                      <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
                      <span>{Math.round(totalCalories)} kcal</span>
                    </h3>
                  </div>

                  {/* Meal Slot Selector */}
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                          mealType === type
                            ? 'bg-emerald-500 text-slate-950 shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Macro Pills */}
                <div className="grid grid-cols-3 gap-2.5 text-center">
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-blue-500/20">
                    <span className="text-[10px] text-slate-400 block font-semibold">Protein</span>
                    <span className="text-base font-black text-blue-400">{totalProtein.toFixed(1)}g</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20">
                    <span className="text-[10px] text-slate-400 block font-semibold">Carbs</span>
                    <span className="text-base font-black text-amber-400">{totalCarbs.toFixed(1)}g</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-xl border border-pink-500/20">
                    <span className="text-[10px] text-slate-400 block font-semibold">Fats</span>
                    <span className="text-base font-black text-pink-400">{totalFats.toFixed(1)}g</span>
                  </div>
                </div>

                {/* Sugar & Cholesterol safety check */}
                <div className="grid grid-cols-2 gap-2.5 mt-2.5 text-center">
                  <div className="bg-slate-900/60 p-2 rounded-xl text-xs flex items-center justify-between px-3">
                    <span className="text-slate-400 text-[11px]">Sugar:</span>
                    <span className="font-bold text-white">{totalSugar.toFixed(1)}g</span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl text-xs flex items-center justify-between px-3">
                    <span className="text-slate-400 text-[11px]">Cholesterol:</span>
                    <span className="font-bold text-white">{totalCholesterol.toFixed(1)}mg</span>
                  </div>
                </div>
              </div>

              {/* Gym Nutritionist Insight */}
              {analysisResult.fitness_insight && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs text-blue-300">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block mb-1">
                    💡 Gym Nutritionist Advice:
                  </span>
                  <p className="leading-relaxed text-slate-200">{analysisResult.fitness_insight}</p>
                </div>
              )}

              {/* Individual Detected Food Items Table */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Detected Components ({analysisResult.items.length})
                </span>

                <div className="space-y-2">
                  {analysisResult.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between gap-3 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">{item.name}</h4>
                          <span className="text-xs font-black text-amber-400">{item.calories} kcal</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{item.portion}</p>
                        <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                          <span>P: <strong className="text-blue-300">{item.macros.protein_g}g</strong></span>
                          <span>C: <strong className="text-amber-300">{item.macros.carbs_g}g</strong></span>
                          <span>F: <strong className="text-pink-300">{item.macros.fats_g}g</strong></span>
                        </div>
                      </div>

                      {/* Portion Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateItemPortion(idx, 0.75)}
                          title="Reduce Portion"
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => updateItemPortion(idx, 1.25)}
                          title="Increase Portion"
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs font-bold"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          title="Remove item"
                          className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Log Meal CTA */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Selected Slot:</span>
                  <span className="font-extrabold text-emerald-400 uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs">
                    {mealType === 'breakfast' && '🌅 Breakfast'}
                    {mealType === 'lunch' && '☀️ Lunch'}
                    {mealType === 'snack' && '🥪 Snack'}
                    {mealType === 'dinner' && '🌙 Dinner'}
                  </span>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">for {selectedDate}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSaveMeal}
                  disabled={isSaving}
                  className="py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{isSaving ? 'Logging Meal...' : `Log to ${mealType.toUpperCase()}`}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3 h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-950 flex items-center justify-center text-slate-600">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white">No Plate Scanned Yet</h3>
              <p className="text-xs max-w-sm text-slate-400 leading-relaxed">
                Take a picture of your food, upload from your phone gallery, or click on one of the quick test meals above (e.g. Dosa & Sambar) to analyze nutritional values instantly.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Gemini Vision API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setShowApiKeyModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400">
                <Key className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Google Gemini API Key</h3>
                <p className="text-xs text-slate-400">Enable real-time photo recognition for any dish</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When connected, CalTracker passes your food photos directly to Google's multimodal Vision model to accurately identify dishes, portions, and hidden ingredients.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                Your Gemini API Key (starts with AIzaSy...)
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Paste your Gemini API Key here"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Don't have a free key yet?</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:underline flex items-center gap-1 font-bold"
              >
                <span>Get free key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                disabled={isSavingKey || !apiKeyInput.trim()}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {isSavingKey ? (
                  <span>Activating...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save & Activate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
