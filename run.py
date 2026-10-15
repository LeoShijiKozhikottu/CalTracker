#!/usr/bin/env python3
"""
CalTracker Universal Cross-Platform Launcher
Works on: Windows, Linux (Ubuntu/Debian/Fedora/Arch), macOS, WSL, Docker
Usage:
    python run.py       (Windows)
    python3 run.py      (Linux / Ubuntu / macOS)
"""

import os
import sys
import shutil
import signal
import subprocess
import threading
from pathlib import Path

# Resolve base directories
ROOT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = ROOT_DIR / "backend"
FRONTEND_DIR = ROOT_DIR / "frontend"

IS_WINDOWS = sys.platform.startswith("win")

def print_banner():
    banner = """
======================================================================
       CALTRACKER - AI Gym Calorie Tracker & Diet Platform
              Universal Launcher (Cross-Platform)
======================================================================
"""
    print(banner)

def get_venv_python() -> Path:
    """Returns the platform-appropriate path to the virtualenv python executable."""
    if IS_WINDOWS:
        return BACKEND_DIR / "venv" / "Scripts" / "python.exe"
    else:
        return BACKEND_DIR / "venv" / "bin" / "python"

def ensure_backend_venv():
    """Creates backend virtualenv and installs dependencies if needed."""
    venv_dir = BACKEND_DIR / "venv"
    venv_python = get_venv_python()

    if not venv_dir.exists() or not venv_python.exists():
        print(f"[*] Creating Python virtual environment in: {venv_dir}...")
        res = subprocess.run([sys.executable, "-m", "venv", str(venv_dir)], cwd=str(BACKEND_DIR))
        if res.returncode != 0:
            print("[!] Error creating virtual environment. Ensure 'python3-venv' is installed on Linux:")
            print("    sudo apt install python3-venv python3-pip")
            sys.exit(1)
        print("[✓] Virtual environment created successfully.")

    # Check and install requirements if uvicorn is missing
    check_uvicorn = subprocess.run(
        [str(venv_python), "-c", "import uvicorn, fastapi, motor"],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    if check_uvicorn.returncode != 0:
        print("[*] Installing backend dependencies from requirements.txt...")
        req_file = BACKEND_DIR / "requirements.txt"
        res = subprocess.run([str(venv_python), "-m", "pip", "install", "-r", str(req_file)], cwd=str(BACKEND_DIR))
        if res.returncode != 0:
            print("[!] Failed to install Python dependencies. Please check terminal output.")
            sys.exit(1)
        print("[✓] Backend dependencies installed.")

def ensure_frontend_deps():
    """Installs frontend npm packages if node_modules does not exist."""
    npm_cmd = shutil.which("npm.cmd" if IS_WINDOWS else "npm")
    if not npm_cmd:
        print("[!] Error: 'npm' not found in system PATH.")
        print("    Please install Node.js (v18+) from: https://nodejs.org or run:")
        print("    sudo apt install nodejs npm   (Ubuntu/Debian)")
        sys.exit(1)

    node_modules = FRONTEND_DIR / "node_modules"
    if not node_modules.exists():
        print("[*] Installing frontend node dependencies (npm install)...")
        res = subprocess.run([npm_cmd, "install"], cwd=str(FRONTEND_DIR), shell=IS_WINDOWS)
        if res.returncode != 0:
            print("[!] Failed to install npm packages.")
            sys.exit(1)
        print("[✓] Frontend dependencies installed.")

def stream_logs(proc: subprocess.Popen, prefix: str, color_code: str):
    """Streams process stdout/stderr with a recognizable colored prefix."""
    reset_code = "\033[0m"
    try:
        for line in iter(proc.stdout.readline, ""):
            if not line:
                break
            print(f"{color_code}{prefix}{reset_code} {line.rstrip()}")
    except Exception:
        pass

def main():
    print_banner()

    # Verify directory structure
    if not BACKEND_DIR.exists() or not FRONTEND_DIR.exists():
        print(f"[!] Invalid execution folder: {ROOT_DIR}")
        print("    Please run this script from the root of CalTracker directory.")
        sys.exit(1)

    print(f"[*] Detected Operating System: {sys.platform} ({'Windows' if IS_WINDOWS else 'Linux/macOS'})")
    ensure_backend_venv()
    ensure_frontend_deps()

    venv_python = get_venv_python()
    npm_cmd = shutil.which("npm.cmd" if IS_WINDOWS else "npm")

    print("\n" + "="*70)
    print("  🚀 Launching CalTracker Services...")
    print("  • Backend API:      http://127.0.0.1:8000")
    print("  • Interactive Docs: http://127.0.0.1:8000/docs")
    print("  • Frontend Web UI:  http://localhost:5173")
    print("  (Press Ctrl+C to stop both servers at any time)")
    print("="*70 + "\n")

    # Launch Backend process
    backend_cmd = [
        str(venv_python), "-m", "uvicorn", "main:app",
        "--reload", "--host", "127.0.0.1", "--port", "8000"
    ]
    backend_proc = subprocess.Popen(
        backend_cmd,
        cwd=str(BACKEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    # Launch Frontend process
    frontend_cmd = [npm_cmd, "run", "dev", "--", "--host", "127.0.0.1"]
    frontend_proc = subprocess.Popen(
        frontend_cmd,
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1,
        shell=IS_WINDOWS
    )

    # Stream logs concurrently in separate threads
    # ANSI Colors: Green for Backend, Cyan for Frontend
    b_thread = threading.Thread(
        target=stream_logs,
        args=(backend_proc, "[Backend]", "\033[92m"),
        daemon=True
    )
    f_thread = threading.Thread(
        target=stream_logs,
        args=(frontend_proc, "[Frontend]", "\033[96m"),
        daemon=True
    )
    b_thread.start()
    f_thread.start()

    # Graceful shutdown handler
    def shutdown_handler(signum, frame):
        print("\n\n[*] Shutting down CalTracker servers...")
        try:
            if backend_proc.poll() is None:
                backend_proc.terminate()
            if frontend_proc.poll() is None:
                frontend_proc.terminate()
            backend_proc.wait(timeout=3)
            frontend_proc.wait(timeout=3)
        except Exception:
            if backend_proc.poll() is None:
                backend_proc.kill()
            if frontend_proc.poll() is None:
                frontend_proc.kill()
        print("[✓] CalTracker shutdown complete. Goodbye!")
        sys.exit(0)

    signal.signal(signal.SIGINT, shutdown_handler)
    if not IS_WINDOWS:
        signal.signal(signal.SIGTERM, shutdown_handler)

    # Monitor processes
    while True:
        try:
            b_poll = backend_proc.poll()
            f_poll = frontend_proc.poll()
            if b_poll is not None:
                print(f"[!] Backend stopped unexpectedly with code {b_poll}.")
                shutdown_handler(None, None)
            if f_poll is not None:
                print(f"[!] Frontend stopped unexpectedly with code {f_poll}.")
                shutdown_handler(None, None)
            threading.Event().wait(1.0)
        except KeyboardInterrupt:
            shutdown_handler(None, None)

if __name__ == "__main__":
    main()

