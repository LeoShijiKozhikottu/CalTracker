# CalTracker: Hosting & Deployment Guide

This guide explains how to host CalTracker both **locally** and **100% free on the cloud** using **MongoDB Atlas**, **Render** (Python Backend), and **Vercel** (TypeScript Frontend).

---

## 1. Quick Start Locally (Development)

### A. Start Python Backend
Open a terminal in `d:\CalTracker\backend`:
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Run FastAPI server
uvicorn main:app --reload --port 8000
```
Backend will be live at: `http://localhost:8000` (Interactive Swagger API documentation at `http://localhost:8000/docs`).

> **Note on Database**: If you haven't connected MongoDB yet, CalTracker automatically uses its built-in resilient local storage engine without crashing! When you add your `MONGO_URI` in `backend/.env`, it will immediately stream to MongoDB.

---

### B. Start Frontend (React + TypeScript)
Open a second terminal in `d:\CalTracker\frontend`:
```powershell
npm run dev
```
Frontend will be live at: `http://localhost:5173`.

---

## 2. Free Cloud Hosting Guide

### Step 1: Set Up Free MongoDB (MongoDB Atlas)
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
2. Create an **M0 Free Shared Cluster** (0$/month).
3. Under **Database Access**, create a database user (e.g. `caluser`) and password.
4. Under **Network Access**, click **Add IP Address** -> select **Allow Access from Anywhere (`0.0.0.0/0`)**.
5. Click **Connect** -> **Connect your application** -> Copy the connection URI:
   ```
   mongodb+srv://caluser:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
   ```

---

### Step 2: Host the Python Backend (Render - Free)
1. Push this repository to your GitHub account (`git init`, `git add .`, `git commit`, `git push`).
2. Go to [render.com](https://render.com) and click **New +** -> **Web Service**.
3. Select your GitHub repository.
4. Set the configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. In **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas URI from Step 1.
   - `DB_NAME`: `caltracker_db`
   - `GEMINI_API_KEY`: *(Optional)* Your Google Gemini API Key from Google AI Studio.
6. Click **Create Web Service**. Your backend will be deployed at `https://your-caltracker-api.onrender.com`.

---

### Step 3: Host the Frontend (Vercel - Free)
1. Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
2. Select your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In `frontend/vite.config.ts` or as an environment variable, configure your backend URL for production:
   - In Vercel Project Settings -> **Environment Variables**, add `VITE_API_URL` pointing to your Render backend URL.
5. Click **Deploy**. Your CalTracker web app is now live for you and your gym friends anywhere on mobile and desktop!

---

## 3. Docker Deployment (Single Server / VPS)
If you have a VPS (AWS EC2, DigitalOcean, Hetzner, etc.):
```bash
docker-compose up --build -d
```
All 3 containers (MongoDB, Backend, and Frontend) will spin up automatically.
