import io
from fastapi.testclient import TestClient
from backend.main import app

def test_complete_user_gym_scenario():
    with TestClient(app) as client:
        # 1. User arrives at website, creates gym buddy profile (Rahul - Bulking)
        profile_data = {
            "name": "Rahul Sharma (Gym Bulking)",
            "age": 23,
            "gender": "male",
            "height_cm": 178.0,
            "weight_kg": 72.0,
            "activity_level": "very_active",
            "fitness_goal": "bulking",
            "diet_style": "high_protein"
        }
        res_profile = client.post("/api/profiles", json=profile_data)
        assert res_profile.status_code == 200
        user = res_profile.json()
        user_id = user["id"]
        assert user["target_calories"] > 2700
        assert user["target_macros"]["protein_g"] >= 140

        # 2. Friend eats Dosa and Sambar for Breakfast -> Takes a photo / uploads plate
        fake_image_bytes = b"GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;"
        vision_res = client.post(
            "/api/vision/analyze-food",
            files={"image": ("breakfast.jpg", io.BytesIO(fake_image_bytes), "image/jpeg")},
            data={"custom_dish_hint": "Dosa and Sambar"}
        )
        assert vision_res.status_code == 200
        vision_data = vision_res.json()
        assert vision_data["success"] is True
        assert len(vision_data["items"]) >= 2
        assert vision_data["total_calories"] > 200

        # Verify sugar, cholesterol, and vitamins are captured in the detected items
        items = vision_data["items"]
        assert any(i["micros"]["sugar_g"] >= 0 for i in items)
        assert any(i["micros"]["cholesterol_mg"] >= 0 for i in items)

        # 3. Log the meal into Breakfast
        log_res = client.post(
            "/api/meals",
            json={
                "user_id": user_id,
                "meal_type": "breakfast",
                "date": "2026-10-06",
                "items": items,
                "notes": vision_data["fitness_insight"],
                "image_url": vision_data["image_url"]
            }
        )
        assert log_res.status_code == 200
        meal_logged = log_res.json()
        assert meal_logged["meal_type"] == "breakfast"

        # 4. Check Daily Summary to inspect remaining calories & macros for afternoon & dinner
        sum_res = client.get(f"/api/meals/daily-summary?user_id={user_id}&date=2026-10-06")
        assert sum_res.status_code == 200
        summary = sum_res.json()
        assert summary["consumed_calories"] > 0
        assert summary["remaining_calories"] < user["target_calories"]
        assert len(summary["meals"]) == 1

        # 5. Check Next-Meal Recommendations
        rec_res = client.get(f"/api/recommendations/next-meal?user_id={user_id}&date=2026-10-06")
        assert rec_res.status_code == 200
        rec_data = rec_res.json()
        
        # Verify afternoon lunch and dinner recommendations are provided
        rec_slots = [r["meal_slot"] for r in rec_data["recommendations"]]
        assert any("Afternoon Lunch" in s for s in rec_slots)
        assert any("Dinner" in s for s in rec_slots)
        assert len(rec_data["nutritionist_tip"]) > 10

        print(f"\n[E2E TEST SUCCESSFUL] Scenario verified! Consumed: {summary['consumed_calories']} kcal, Remaining: {summary['remaining_calories']} kcal.")
