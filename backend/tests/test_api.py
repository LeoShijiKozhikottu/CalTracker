from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_profiles_listing_and_creation():
    # 1. Listing profiles should return at least 1 profile
    res = client.get("/api/profiles")
    assert res.status_code == 200
    profiles = res.json()
    assert len(profiles) >= 1
    assert any("Leon" in p["name"] for p in profiles)

    # 2. Create a new custom gym buddy profile
    new_profile = {
        "name": "Karthik (CrossFit)",
        "age": 27,
        "gender": "male",
        "height_cm": 176.0,
        "weight_kg": 74.0,
        "activity_level": "very_active",
        "fitness_goal": "bulking",
        "diet_style": "high_protein"
    }
    create_res = client.post("/api/profiles", json=new_profile)
    assert create_res.status_code == 200
    created = create_res.json()
    assert created["name"] == "Karthik (CrossFit)"
    assert created["target_calories"] > 2500
    assert "target_macros" in created

    # 3. Get daily summary for this user
    sum_res = client.get(f"/api/meals/daily-summary?user_id={created['id']}&date=2026-10-06")
    assert sum_res.status_code == 200
    summary = sum_res.json()
    assert summary["consumed_calories"] == 0.0
    assert summary["remaining_calories"] == created["target_calories"]

    # 4. Get recommendations for this user
    rec_res = client.get(f"/api/recommendations/next-meal?user_id={created['id']}&date=2026-10-06")
    assert rec_res.status_code == 200
    recs = rec_res.json()
    assert len(recs["recommendations"]) > 0

def test_auth_and_login():
    # Test registering a new user with overweight loss goal
    reg_res = client.post("/api/auth/register", json={
        "name": "Test Gymmer",
        "email": "test_gymmer_api@gym.com",
        "password": "secretpassword",
        "age": 30,
        "gender": "male",
        "height_cm": 172.0,
        "weight_kg": 95.0,
        "activity_level": "lightly_active",
        "fitness_goal": "overweight_loss",
        "diet_style": "low_carb"
    })
    assert reg_res.status_code in [200, 400]

    # Test logging in as the registered user
    login_res = client.post("/api/auth/login", json={
        "email": "test_gymmer_api@gym.com",
        "password": "secretpassword"
    })
    assert login_res.status_code == 200
    login_data = login_res.json()
    assert "access_token" in login_data
    assert login_data["user"]["name"] == "Test Gymmer"

def test_exercises_and_workout_logging():
    # 1. List exercises
    ex_res = client.get("/api/exercises")
    assert ex_res.status_code == 200
    exercises = ex_res.json()
    assert len(exercises) >= 10

    # 2. Filter overweight joint-safe exercises
    ow_res = client.get("/api/exercises?category=overweight")
    assert ow_res.status_code == 200
    ow_exercises = ow_res.json()
    assert len(ow_exercises) >= 5
    assert any("Incline Treadmill" in e["name"] for e in ow_exercises)

    # 3. Log a workout
    profiles = client.get("/api/profiles").json()
    user_id = profiles[0]["id"]
    log_res = client.post("/api/exercises/log", json={
        "user_id": user_id,
        "exercise_id": exercises[0]["id"],
        "exercise_name": exercises[0]["name"],
        "date": "2026-10-09",
        "duration_minutes": 25.0,
        "sets": 3,
        "reps": 12,
        "calories_burned": 180.0,
        "notes": "Great warm-up session"
    })
    assert log_res.status_code == 200
    logged_data = log_res.json()
    assert logged_data["calories_burned"] == 180.0

    # 4. Fetch daily workout logs
    daily_logs = client.get(f"/api/exercises/logs/daily?user_id={user_id}&date=2026-10-09")
    assert daily_logs.status_code == 200
    assert len(daily_logs.json()) >= 1

def test_community_friends_comparison():
    res = client.get("/api/community/friends?date=2026-10-09")
    assert res.status_code == 200
    friends = res.json()
    assert len(friends) >= 1
    assert "target_calories" in friends[0]
    assert "status_badge" in friends[0]

    # Compare two friends
    if len(friends) >= 2:
        comp_res = client.get(f"/api/community/compare?user1_id={friends[0]['user_id']}&user2_id={friends[1]['user_id']}&date=2026-10-09")
        assert comp_res.status_code == 200
        comp_data = comp_res.json()
        assert "friend_1" in comp_data
        assert "friend_2" in comp_data

