@echo off
setlocal
cd /d "%~dp0"
title Hero Typing - Pechat Geroya

echo ========================================================
echo    Hero Typing / Pechat Geroya - Quick Start
echo    Cyber-Ryvok 2026 Hackathon
echo ========================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+ and add to PATH.
    pause
    exit /b 1
)

REM 2. Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+ and add to PATH.
    pause
    exit /b 1
)

echo [1/3] Checking Backend dependencies...
python -m pip install -r backend\requirements.txt

echo [2/3] Checking Frontend dependencies...
if not exist "frontend\node_modules\" (
    echo Installing npm packages in frontend...
    cd frontend && call npm install && cd ..
)

echo [3/3] Launching Backend and Frontend...
echo Starting Backend API on http://127.0.0.1:8000 ...
start "HeroTyping-Backend" cmd /k "python -m uvicorn main:app --app-dir backend --reload --port 8000"

ping 127.0.0.1 -n 3 >nul

echo Starting Frontend on http://localhost:3000 ...
start "HeroTyping-Frontend" cmd /k "cd frontend && npm run dev"

ping 127.0.0.1 -n 3 >nul

start http://localhost:3000

echo.
echo ========================================================
echo    All services started successfully!
echo    - Frontend:    http://localhost:3000
echo    - Backend API: http://127.0.0.1:8000
echo    - Swagger UI:  http://127.0.0.1:8000/docs
echo ========================================================
echo.
echo Close this window or press any key.
pause
