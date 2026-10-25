import os
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Body
from typing import Optional
import base64
from config import settings
from services.gemini_service import analyze_food_image

router = APIRouter(prefix="/vision", tags=["Vision AI"])

@router.get("/status")
async def vision_status():
    has_key = bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 10)
    return {
        "gemini_api_configured": has_key,
        "mode": "live_vision" if has_key else "smart_offline_analyzer"
    }

@router.post("/set-api-key")
async def set_gemini_api_key(payload: dict = Body(...)):
    key = payload.get("api_key", "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key cannot be empty")
    settings.GEMINI_API_KEY = key
    
    # Save/update to backend/.env
    env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    env_lines = []
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            env_lines = f.readlines()
            
    key_written = False
    new_lines = []
    for line in env_lines:
        if line.strip().startswith("GEMINI_API_KEY="):
            new_lines.append(f"GEMINI_API_KEY={key}\n")
            key_written = True
        else:
            new_lines.append(line)
    if not key_written:
        new_lines.append(f"\nGEMINI_API_KEY={key}\n")
        
    try:
        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception as e:
        pass
        
    return {
        "success": True, 
        "message": "Gemini API key saved! Live AI Vision is now active."
    }

@router.post("/analyze-food")
async def analyze_food(
    image: UploadFile = File(...),
    custom_dish_hint: Optional[str] = Form(None)
):
    try:
        contents = await image.read()
        if len(contents) == 0:
            raise HTTPException(status_code=400, detail="Empty image file received.")
            
        items, insight = await analyze_food_image(
            contents, 
            filename=image.filename or "food.jpg", 
            custom_dish_hint=custom_dish_hint
        )
        
        encoded_img = base64.b64encode(contents).decode("utf-8")
        content_type = image.content_type or "image/jpeg"
        image_data_uri = f"data:{content_type};base64,{encoded_img}"

        tot_cals = sum(i.calories for i in items)
        tot_p = sum(i.macros.protein_g for i in items)
        tot_c = sum(i.macros.carbs_g for i in items)
        tot_f = sum(i.macros.fats_g for i in items)

        tot_sugar = sum(i.micros.sugar_g for i in items)
        tot_chol = sum(i.micros.cholesterol_mg for i in items)
        tot_sod = sum(i.micros.sodium_mg for i in items)
        tot_fib = sum(i.micros.fiber_g for i in items)
        tot_va = sum(i.micros.vitamin_a_mcg for i in items)
        tot_vc = sum(i.micros.vitamin_c_mg for i in items)
        tot_vd = sum(i.micros.vitamin_d_iu for i in items)
        tot_vb12 = sum(i.micros.vitamin_b12_mcg for i in items)
        tot_iron = sum(i.micros.iron_mg for i in items)
        tot_calc = sum(i.micros.calcium_mg for i in items)
        tot_pot = sum(i.micros.potassium_mg for i in items)

        is_live = "[Live Vision AI]" in insight
        clean_insight = insight.replace("[Live Vision AI] ", "")

        return {
            "success": True,
            "filename": image.filename or "food.jpg",
            "image_url": image_data_uri,
            "items": [item.model_dump() for item in items],
            "total_calories": round(tot_cals, 1),
            "total_macros": {
                "protein_g": round(tot_p, 1),
                "carbs_g": round(tot_c, 1),
                "fats_g": round(tot_f, 1)
            },
            "total_micros": {
                "sugar_g": round(tot_sugar, 1),
                "cholesterol_mg": round(tot_chol, 1),
                "sodium_mg": round(tot_sod, 1),
                "fiber_g": round(tot_fib, 1),
                "vitamin_a_mcg": round(tot_va, 1),
                "vitamin_c_mg": round(tot_vc, 1),
                "vitamin_d_iu": round(tot_vd, 1),
                "vitamin_b12_mcg": round(tot_vb12, 1),
                "iron_mg": round(tot_iron, 1),
                "calcium_mg": round(tot_calc, 1),
                "potassium_mg": round(tot_pot, 1)
            },
            "fitness_insight": clean_insight,
            "is_live_ai": is_live,
            "gemini_api_configured": bool(settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 10)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis error: {str(e)}")
