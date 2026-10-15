#!/usr/bin/env bash
# ==============================================================================
# CalTracker Native Linux / Ubuntu / Debian / macOS Launcher
# Usage:
#   chmod +x start_caltracker.sh
#   ./start_caltracker.sh
# ==============================================================================

set -e

# Resolve directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

echo "========================================================"
echo "       Starting CalTracker - Gym Diet & Calorie App"
echo "========================================================"
echo ""

# Check python3
if ! command -v python3 &> /dev/null; then
    echo "[!] python3 is not installed."
    echo "    Run: sudo apt update && sudo apt install -y python3 python3-pip python3-venv"
    exit 1
fi

# Check npm/node
if ! command -v npm &> /dev/null; then
    echo "[!] npm / Node.js is not installed."
    echo "    Run: sudo apt update && sudo apt install -y nodejs npm"
    exit 1
fi

# 1. Setup Backend venv
cd "$BACKEND_DIR"
if [ ! -d "venv" ]; then
    echo "[*] Creating Python virtual environment..."
    python3 -m venv venv || {
        echo "[!] Error creating venv. Please run: sudo apt install python3-venv"
        exit 1
    }
fi

source venv/bin/activate

# Check dependencies
if ! python3 -c "import fastapi, uvicorn, motor" &> /dev/null; then
    echo "[*] Installing backend dependencies from requirements.txt..."
    pip install -r requirements.txt
fi

echo "[*] Launching FastAPI Backend on http://127.0.0.1:8000..."
uvicorn main:app --reload --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 2. Setup Frontend
cd "$FRONTEND_DIR"
if [ ! -d "node_modules" ]; then
    echo "[*] Installing frontend dependencies (npm install)..."
    npm install
fi

echo "[*] Launching Vite Frontend on http://localhost:5173..."
npm run dev -- --host 127.0.0.1 &
FRONTEND_PID=$!

# Trap Ctrl+C (SIGINT) and kill both child processes
trap "echo ''; echo '[*] Stopping CalTracker servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit 0" SIGINT SIGTERM

echo ""
echo "========================================================"
echo "  Both Services are Live:"
echo "  • Backend API:      http://127.0.0.1:8000"
echo "  • Swagger Docs:     http://127.0.0.1:8000/docs"
echo "  • Web Application:  http://localhost:5173"
echo "  (Press Ctrl+C to stop both servers)"
echo "========================================================"
echo ""

# Wait for both background processes
wait

