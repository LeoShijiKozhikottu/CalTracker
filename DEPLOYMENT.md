# CalTracker: Hosting & Deployment Guide

This guide explains how to host CalTracker both **100% free in production on the cloud** and **locally / in Docker**.

---

## 🌟 Live Production Deployment (Current Architecture)

Your full-stack application is deployed and live in the cloud:

| Component | Platform | Live URL / Endpoint | Details |
| :--- | :--- | :--- | :--- |
| **Frontend UI** | **Vercel** | Your Vercel domain (`https://*-leo-krf.vercel.app`) | React 18, Vite, Tailwind CSS, Lucide icons |
| **Backend API** | **Render** | `https://caltracker-backend-kfkh.onrender.com` | FastAPI, Python 3.11, Uvicorn |
| **API Docs (Swagger)** | **Render** | `https://caltracker-backend-kfkh.onrender.com/docs` | Interactive API documentation |
| **Health Check** | **Render** | `https://caltracker-backend-kfkh.onrender.com/api/health` | Live backend & database status |
| **Database** | **MongoDB Atlas** | Cloud Replica Set (`caltracker_db`) | Free M0 tier with persistent storage |
| **AI Vision Model** | **Google Gemini** | Google GenAI API | Multimodal food plate analysis |

---

## 1. Quick Start Locally (Universal Cross-Platform)

### Option A: Universal 1-Command (All Operating Systems)
From the root directory:
```bash
python run.py       # Windows
python3 run.py      # Linux / Ubuntu / macOS
```
*Automatically detects the OS, prepares the Python venv, installs npm dependencies, and launches both services simultaneously.*

### Option B: Linux / Ubuntu Native Script
```bash
chmod +x start_caltracker.sh
./start_caltracker.sh
```

### Option C: Manual Launch by Operating System

#### 🐧 Linux / Ubuntu:
```bash
# Terminal 1 - Backend (FastAPI):
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2 - Frontend (React + TypeScript):
cd frontend
npm install
npm run dev
```

#### 🪟 Windows:
```powershell
# Terminal 1 - Backend (FastAPI):
cd backend
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000

# Terminal 2 - Frontend (React + TypeScript):
cd frontend
npm install
npm run dev
```

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

## 3. Docker Deployment (Local Machine & Cloud VPS)

Docker packages CalTracker into isolated, portable containers that run identically on **Windows, macOS, Ubuntu, Debian, AWS EC2, DigitalOcean, Linode, or Hetzner**.

### 🏗️ Docker Architecture Overview
When you deploy with Docker Compose, 3 coordinated containers are launched in an internal bridge network:

```
                  ┌──────────────────────────────────────────────┐
                  │                 USER BROWSER                 │
                  └───────────────┬──────────────┬───────────────┘
                                  │ :3000        │ :8000
                                  ▼              ▼
           ┌─────────────────────────────┐  ┌─────────────────────────┐
           │   caltracker_frontend       │  │   caltracker_backend    │
           │  (Nginx + Built React App)  │  │   (FastAPI + Uvicorn)   │
           │  Proxies /api ─────────────►│──┼─►                       │
           └─────────────────────────────┘  └────────────┬────────────┘
                                                         │ :27017
                                                         ▼
                                            ┌─────────────────────────┐
                                            │   caltracker_mongodb    │
                                            │   (Persistent Volume)   │
                                            └─────────────────────────┘
```

- **Frontend Container (`caltracker_frontend`)**: Nginx serving the production-built React/TypeScript app on port `3000` (or `80`) and automatically reverse-proxying all `/api/*` traffic to the backend.
- **Backend Container (`caltracker_backend`)**: Python 3.10 slim running FastAPI and Uvicorn on port `8000`.
- **Database Container (`caltracker_mongodb`)**: MongoDB with a persistent Docker volume (`mongo_data`) so all logged meals, user stats, and workout history survive restarts and updates.

---

### Step 1: Install Docker & Docker Compose

#### 🪟 Windows or 🍏 macOS:
1. Download and install **Docker Desktop** from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/).
2. On Windows, ensure WSL 2 backend is enabled during installation.
3. Start Docker Desktop and verify in PowerShell / Terminal:
   ```bash
   docker --version
   docker compose version
   ```

#### 🐧 Linux / Ubuntu / Debian VPS:
Run the official Docker convenience script:
```bash
# Update and install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Enable non-root user permissions
sudo usermod -aG docker $USER
newgrp docker

# Verify Docker Compose v2 is active
docker compose version
```

---

### Step 2: Configure Environment Variables

Create or edit your `.env` file in the project root:

```bash
# Optional: Google Gemini Vision AI key for live food scanning
# Get a free key at: https://aistudio.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: If you prefer MongoDB Atlas cloud instead of the local mongo container:
# MONGO_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority
```

*(If you leave `MONGO_URI` blank, CalTracker automatically uses the built-in `caltracker_mongodb` container!)*

---

### Step 3: Build & Start All Containers

Run the following command from the root `CalTracker/` directory:

```bash
docker compose up --build -d
```
*(On older versions of docker-compose, use `docker-compose up --build -d`)*

Docker will:
1. Pull the official MongoDB image.
2. Build the optimized Python backend image with all dependencies.
3. Build the React/TypeScript production bundle and place it inside lightweight Nginx.
4. Launch all 3 services in background detached mode (`-d`).

---

### Step 4: Verify Deployment

1. Check running containers:
   ```bash
   docker compose ps
   ```
   You should see 3 containers in `Up` status:
   - `caltracker_frontend` on `0.0.0.0:3000->80/tcp`
   - `caltracker_backend` on `0.0.0.0:8000->8000/tcp`
   - `caltracker_mongodb` on `0.0.0.0:27017->27017/tcp`

2. Open the application:
   - **Web UI**: Open your browser to [http://localhost:3000](http://localhost:3000) (or `http://YOUR_SERVER_IP:3000`).
   - **Swagger API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **Backend Health Check**: [http://localhost:8000/api/health](http://localhost:8000/api/health)

---

### Step 5: Useful Docker Commands for Maintenance

| Task | Command |
| :--- | :--- |
| **View live logs for all services** | `docker compose logs -f` |
| **View backend logs only** | `docker compose logs -f backend` |
| **View frontend/nginx logs only** | `docker compose logs -f frontend` |
| **Restart all containers** | `docker compose restart` |
| **Stop all containers (without losing data)** | `docker compose down` |
| **Rebuild after making code changes** | `docker compose up --build -d` |
| **Check container resource usage (CPU/RAM)** | `docker stats` |
| **Wipe all containers & data volume (Clean Slate)** | `docker compose down -v` |

---

### Step 6: Production VPS Domain & Free SSL (HTTPS)

If deploying to a public VPS (DigitalOcean, AWS, Hetzner, etc.):

1. **Expose Port 80 directly:**
   In `docker-compose.yml`, change the frontend port mapping from `"3000:80"` to `"80:80"`.
2. **Point your domain:**
   Create an **A Record** in your DNS provider (e.g. Cloudflare, Namecheap) pointing `caltracker.yourdomain.com` to your VPS public IP address.
3. **Free SSL with Cloudflare or Certbot:**
   - **Option A (Easiest)**: Route your domain through Cloudflare and enable **SSL/TLS Full**. Cloudflare provides automatic HTTPS with zero extra server configuration.
   - **Option B (Certbot)**: Use Certbot or an Nginx reverse proxy with automated Let's Encrypt certificates.
