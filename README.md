# 🏋️‍♂️ CalTracker - AI Gym Diet, Multi-Window Calorie Tracker & Workout System

**CalTracker** is a modern full-stack web application built with **React (Frontend)** and **Python FastAPI (Backend)** designed for gym-goers, friends, and fitness enthusiasts who have personalized dietary requirements (bulking, cutting, overweight safe deficit, maintenance, vegetarian, high-protein).

Users can snap a picture or upload photos of their meals (e.g. **Dosa and Sambar**), instantly get calories, macronutrients (Protein, Carbs, Fats), and crucial micronutrients (**Sugar, Cholesterol, Fiber, Vitamins & Minerals**), track their remaining daily targets, receive **smart food recommendations for upcoming meals (Afternoon Lunch, Dinner, Pre-workout)** to perfectly hit their daily fitness plan, access tailored gym workouts for different body types, and compare progress with friends in a dedicated window.

---

## 🪟 Dedicated Multi-Window Architecture (No Overcrowding!)

To prevent information overload on a single screen, the application is divided into dedicated, clean windows:

1. **📊 Today's Intake (Dashboard Window)**:
   - Target vs. Consumed vs. Gym Burned vs. Net Calories.
   - Macronutrient gauges (Protein, Carbohydrates, Healthy Fats).
   - Micronutrient safety meters: Added Sugar (safety cap alerts), Cholesterol (heart check), Fiber (gut health), and complete vitamin breakdown (Vit C, Vit D, Vit B12, Iron, Calcium, Potassium).
   - Logged meals timeline with portion breakdown and deletion controls.

2. **📸 AI Food Camera & Scanner Window**:
   - Device Camera capture with live stream preview & photo snap.
   - Gallery file upload with drag-and-drop.
   - **1-Click Pre-loaded Example Plates**: Test immediately with dishes like *Crispy Dosa & Sambar with Chutney*, *Grilled Chicken with Brown Rice*, *Paneer Bhurji & Roti*, and *Berry Oatmeal*.
   - Interactive portion modifiers (`+` / `-`) and 1-click logging to Breakfast, Lunch, Snack, or Dinner.

3. **💡 Smart Meal Suggestions Window (Afternoon & Dinner Gap Filler)**:
   - Dynamic real-time calculation of remaining nutritional budget (e.g., if you ate Dosa and Sambar for breakfast, it calculates remaining calories and protein deficit).
   - Suggests balanced options for **Afternoon Lunch (1:00 PM)**, **Evening Pre-Workout Snack (5:00 PM)**, and **Night Dinner (8:00 PM)**.
   - 1-Click "Quick Log This Meal" button.

4. **🏋️‍♂️ Gym Exercises & Workouts Window**:
   - Curated exercise catalog tailored for different body goals:
     - **Overweight / Joint-Safe**: Knee- and spine-protecting exercises (Incline Treadmill Brisk Walk, Recumbent Bike, Cable Lat Pulldowns, Box Squats, Low-Impact Elliptical, Glute Bridges).
     - **Weight Loss / Fat Burn**: High-calorie burn HIIT & cardio circuits (HIIT Sprints, Kettlebell Swings, Rowing Machine, Battle Ropes, Thrusters).
     - **Muscle Gain / Bulking**: Compound hypertrophy lifts (Barbell Squats, Bench Press, Romanian Deadlifts, Pull-Ups, Incline Dumbbell Press).
     - **Athletic & Core**: Functional conditioning (Heavy Farmer's Walks, Face Pulls, Hanging Leg Raises).
   - Built-in Workout Logger: Log completed sets, reps, duration, and calories burned to offset daily net calories.

5. **👥 Gym Friends & Progress Comparison Window**:
   - Overview of all gym buddies with their personalized diet styles and targets.
   - Comparison of daily calories reached, protein targets, workouts completed, and streak days.
   - **Head-to-Head Gym Buddy Duel**: Pick any two friends to view side-by-side metrics.
   - 1-Click "Switch to View Friend's Account" button.

6. **⚙️ My Diet & Body Profile Window**:
   - Mifflin-St Jeor formula calculating Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE).
   - Customizable weight, height, age, gender, activity level, fitness goal, and diet style.
   - Custom calorie and protein override options.

7. **🔐 User Authentication Window (Login & Register)**:
   - Clean authentication with multi-account registration and password security.
   - **1-Click Instant Demo Logins**:
     - *Rahul* (Bulking Goal - 3,363 kcal)
     - *Sneha* (Cutting / Fat Loss - 1,684 kcal)
     - *Vikram* (Vegetarian Bulking - 3,120 kcal)
     - *Priya* (Overweight Joint-Safe - 1,850 kcal)

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide React, Canvas Confetti.
- **Backend**: Python 3.10+, FastAPI, Pydantic v2, Motor (Async MongoDB Driver), Uvicorn.
- **AI Vision**: Google Gemini Vision API (`gemini-2.5-flash`) with structured output + smart offline nutritional fallback.
- **Database**: MongoDB (Atlas Cloud / Local) with resilient local JSON fallback (zero configuration required).
- **Deployment**: Docker, Docker Compose, Render, Vercel.

---

## 🚀 Running the Project

### Option 1: Universal 1-Command Launch (Recommended for ALL Operating Systems)
Run in the root project folder:
```bash
python run.py       # Windows
python3 run.py      # Linux / Ubuntu / Debian / macOS
```
*This cross-platform Python orchestrator automatically detects your operating system, configures the virtual environment, installs any missing backend/frontend packages, and launches both services simultaneously with synchronized logging and graceful shutdown (`Ctrl + C`).*

---

### Option 2: Linux / Ubuntu / Debian / macOS (Native Bash Script)
```bash
chmod +x start_caltracker.sh
./start_caltracker.sh
```

---

### Option 3: Windows (1-Click Batch File)
Double-click `start_caltracker.bat` or run in Command Prompt:
```cmd
start_caltracker.bat
```

---

### Option 4: Manual Step-by-Step Launch

#### 🐧 On Linux / Ubuntu / Debian / macOS:
```bash
# Step 1: Ensure Python venv and Node are installed (Ubuntu/Debian)
sudo apt update && sudo apt install -y python3 python3-pip python3-venv nodejs npm

# Step 2: Launch Backend (Terminal 1)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Step 3: Launch Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

#### 🪟 On Windows:
```powershell
# Terminal 1 - Backend (FastAPI):
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend (React + Vite):
cd frontend
npm install
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`

---

## ☁️ Cloud Hosting & Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step guides on deploying:
- **Database**: Free MongoDB Atlas (M0 Cluster)
- **Backend**: Free Render / Railway Python Web Service
- **Frontend**: Free Vercel / Netlify Web Hosting
