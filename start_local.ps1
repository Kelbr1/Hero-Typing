# Запуск проекта Печать героя для Windows PowerShell
Set-Location -Path $PSScriptRoot
$Host.UI.RawUI.WindowTitle = "Печать героя - Запуск"

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Печать героя - Тренажёр слепой печати" -ForegroundColor Cyan
Write-Host "   Хакатон «Киберрывок 2026»" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# Проверка Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "[ОШИБКА] Python не найден. Установите Python 3.10+." -ForegroundColor Red
    Pause
    Exit 1
}

# Проверка Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[ОШИБКА] Node.js не найден. Установите Node.js 18+." -ForegroundColor Red
    Pause
    Exit 1
}

Write-Host "[1/3] Проверка зависимостей Backend..." -ForegroundColor Yellow
python -m pip install -r backend/requirements.txt | Out-Null

Write-Host "[2/3] Проверка зависимостей Frontend..." -ForegroundColor Yellow
if (-not (Test-Path "frontend/node_modules")) {
    Write-Host "Установка npm зависимостей..." -ForegroundColor Gray
    Push-Location frontend
    npm install | Out-Null
    Pop-Location
}

Write-Host "[3/3] Запуск Backend и Frontend..." -ForegroundColor Green
Write-Host "Запуск Backend API на http://127.0.0.1:8000..." -ForegroundColor Gray
Start-Process cmd -ArgumentList "/k title HeroTyping-Backend && python -m uvicorn main:app --app-dir backend --reload --port 8000"

Start-Sleep -Seconds 2

Write-Host "Запуск Frontend на http://localhost:3000..." -ForegroundColor Gray
Start-Process cmd -ArgumentList "/k title HeroTyping-Frontend && cd frontend && npm run dev"

Start-Sleep -Seconds 2

Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "   Сервисы запущены:" -ForegroundColor Green
Write-Host "   - Frontend:    http://localhost:3000" -ForegroundColor White
Write-Host "   - Backend API: http://127.0.0.1:8000" -ForegroundColor White
Write-Host "   - Swagger UI:  http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Нажмите любую клавишу для выхода из этого окна..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
