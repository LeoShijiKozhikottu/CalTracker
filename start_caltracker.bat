@echo off
echo ========================================================
echo        Starting CalTracker - Gym Diet & Calorie App
echo ========================================================
echo.

start "CalTracker Backend (FastAPI)" cmd /k "cd /d D:\CalTracker\backend && venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

timeout /t 3 /nobreak >nul

start "CalTracker Frontend (Vite + React)" cmd /k "cd /d D:\CalTracker\frontend && npm run dev"

echo.
echo Both Backend (http://127.0.0.1:8000) and Frontend (http://localhost:5173) are launching!
echo Browser will be accessible at: http://localhost:5173
echo ========================================================
pause
