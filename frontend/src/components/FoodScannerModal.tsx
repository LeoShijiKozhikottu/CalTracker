import React, { useState, useRef } from 'react';
import { api } from '../api/client';
import type { FoodItem, MealType } from '../types';
import {
  X,
  Upload,
  Camera,
  Sparkles,
  Check,
  Trash2,
  AlertCircle,
  RefreshCw,
  Utensils
} from 'lucide-react';

interface FoodScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedDate: string;
  onMealLogged: () => void;
}

export const FoodScannerModal: React.FC<FoodScannerModalProps> = ({
  isOpen,
  onClose,
  userId,
  selectedDate,
  onMealLogged
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dishHint, setDishHint] = useState<string>('Dosa and Sambar');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<{
    items: FoodItem[];
    fitness_insight: string;
    image_url: string;
  } | null>(null);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
      setAnalysisResult(null);
    }
  };

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      let fileToSend = selectedFile;
      
      // If user clicks analyze without selecting a file, create a lightweight synthetic image with canvas
      // so they can test immediately with the dish hint (e.g. Dosa and Sambar)!
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
        image_url: res.image_url
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze food image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!analysisResult || analysisResult.items.length === 0) return;
    setIsSaving(true);
    try {
      await api.logMeal({
        userId,
        mealType,
        date: selectedDate,
        items: analysisResult.items,
        imageUrl: analysisResult.image_url,
        notes: analysisResult.fitness_insight
      });
      onMealLogged();
      handleClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save meal.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setErrorMsg(null);
    onClose();
  };

  const updateItemPortion = (idx: number, multiplier: number) => {
    if (!analysisResult) return;
    const newItems = [...analysisResult.items];
    const item = newItems[idx];
    const prevCals = item.calories;
    const newCals = Math.round(prevCals * multiplier);
    item.calories = newCals;
    item.macros.protein_g = Math.round(item.macros.protein_g * multiplier * 10) / 10;
    item.macros.carbs_g = Math.round(item.macros.carbs_g * multiplier * 10) / 10;
    item.macros.fats_g = Math.round(item.macros.fats_g * multiplier * 10) / 10;
    item.micros.sugar_g = Math.round(item.micros.sugar_g * multiplier * 10) / 10;
    item.micros.cholesterol_mg = Math.round(item.micros.cholesterol_mg * multiplier * 10) / 10;
    setAnalysisResult({ ...analysisResult, items: newItems });
  };

  const removeItem = (idx: number) => {
    if (!analysisResult) return;
    const newItems = analysisResult.items.filter((_, i) => i !== idx);
    setAnalysisResult({ ...analysisResult, items: newItems });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Food & Calorie Scanner</h2>
              <p className="text-xs text-slate-400">Take or upload a picture to instantly check calories & nutrition</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!analysisResult ? (
            /* Upload & Preview Step */
            <div className="space-y-4">
              
              {/* Photo Input Box */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  previewUrl
                    ? 'border-emerald-500/40 bg-slate-800/40'
                    : 'border-slate-700 hover:border-emerald-500/50 bg-slate-800/20 hover:bg-slate-800/40'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {previewUrl ? (
                  <div className="relative group">
                    <img
                      src={previewUrl}
                      alt="Food preview"
                      className="max-h-56 mx-auto rounded-xl object-contain shadow-md"
                    />
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-all">
                      <span className="text-xs font-semibold text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                        Click to change photo
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">
                        Upload food photo or tap to take picture
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Supports JPEG, PNG, WEBP (Camera capture supported on mobile)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Dish Hint Input (Useful for accuracy & instant offline testing) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Dish Name / Hint (Optional):</span>
                </label>
                <input
                  type="text"
                  value={dishHint}
                  onChange={(e) => setDishHint(e.target.value)}
                  placeholder="e.g. Dosa and Sambar, Chicken Breast with Brown Rice, Eggs and Toast"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400">
                  Tip: Pre-filled with "Dosa and Sambar" to test immediately even without uploading your own photo!
                </p>
              </div>

              {/* Meal Slot Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Select Meal Slot:</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['breakfast', 'lunch', 'snack', 'dinner'] as MealType[]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setMealType(slot)}
                      className={`py-2 text-xs font-bold rounded-xl capitalize border transition-all ${
                        mealType === slot
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-800/70 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={handleStartAnalysis}
                disabled={isAnalyzing}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Plate & Estimating Calories...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950" />
                    <span>Analyze Food with AI Vision</span>
                  </>
                )}
              </button>

            </div>
          ) : (
            /* Analysis Results Review Step */
            <div className="space-y-5">
              
              {/* Plate Summary Header */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Estimated Total</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">
                      {Math.round(analysisResult.items.reduce((acc, i) => acc + i.calories, 0))} <span className="text-xs font-semibold text-slate-400">kcal</span>
                    </span>
                    <span className="text-xs text-blue-400 font-semibold">
                      {Math.round(analysisResult.items.reduce((acc, i) => acc + i.macros.protein_g, 0))}g Protein
                    </span>
                    <span className="text-xs text-amber-400 font-semibold">
                      {Math.round(analysisResult.items.reduce((acc, i) => acc + i.macros.carbs_g, 0))}g Carbs
                    </span>
                    <span className="text-xs text-pink-400 font-semibold">
                      {Math.round(analysisResult.items.reduce((acc, i) => acc + i.macros.fats_g, 0))}g Fats
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Logging into:</span>
                  <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-lg capitalize">
                    {mealType}
                  </span>
                </div>
              </div>

              {/* Gym Fitness Insight Banner */}
              {analysisResult.fitness_insight && (
                <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-200 text-xs flex gap-2.5">
                  <Sparkles className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                  <div>
                    <strong className="font-bold text-white block mb-0.5">Trainer & Nutritionist Note:</strong>
                    <span>{analysisResult.fitness_insight}</span>
                  </div>
                </div>
              )}

              {/* Items List Breakdown */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Detected Food Items ({analysisResult.items.length})
                </span>

                {analysisResult.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                        <p className="text-xs text-slate-400">{item.portion}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-sm text-white">{item.calories} kcal</span>
                        <div className="flex gap-1.5 text-[10px] font-semibold mt-0.5">
                          <span className="text-blue-400">{item.macros.protein_g}g P</span>
                          <span className="text-amber-400">{item.macros.carbs_g}g C</span>
                          <span className="text-pink-400">{item.macros.fats_g}g F</span>
                        </div>
                      </div>
                    </div>

                    {/* Micro details pills: Sugar, Cholesterol, Vitamins */}
                    <div className="flex flex-wrap gap-2 text-[10px] text-slate-300 pt-1 border-t border-slate-700/40">
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded">Sugar: {item.micros.sugar_g}g</span>
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded">Cholesterol: {item.micros.cholesterol_mg}mg</span>
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded">Fiber: {item.micros.fiber_g}g</span>
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded">Vit C: {item.micros.vitamin_c_mg}mg</span>
                      <span className="bg-slate-700/50 px-2 py-0.5 rounded">Iron: {item.micros.iron_mg}mg</span>
                    </div>

                    {/* Portion adjustments */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-medium">Quick Portion:</span>
                        <button
                          onClick={() => updateItemPortion(idx, 0.5)}
                          className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200"
                        >
                          0.5x
                        </button>
                        <button
                          onClick={() => updateItemPortion(idx, 1.5)}
                          className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200"
                        >
                          1.5x
                        </button>
                        <button
                          onClick={() => updateItemPortion(idx, 2.0)}
                          className="px-1.5 py-0.5 bg-slate-700 hover:bg-slate-600 rounded text-[10px] text-slate-200"
                        >
                          2x
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-400 p-1 transition-colors"
                        title="Remove Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setAnalysisResult(null)}
                  className="w-1/3 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 transition-all"
                >
                  Scan Another
                </button>
                <button
                  onClick={handleSaveMeal}
                  disabled={isSaving || analysisResult.items.length === 0}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving to Food Log...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Confirm & Save to {mealType.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
