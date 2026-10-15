@echo off
setlocal
cd /d "%~dp0"

echo ========================================================
echo        Starting CalTracker - Gym Diet & Calorie App
echo ========================================================
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [*] Launching via Universal Python Orchestrator...
    python run.py
) else (
    echo [!] Python was not found in your system PATH.
    echo [*] Attempting local venv launch...
    if exist "backend\venv\Scripts\python.exe" (
        backend\venv\Scripts\python.exe run.py
    ) else (
        echo [!] Please install Python 3.10+ from python.org or add it to PATH.
        pause
    )
)
