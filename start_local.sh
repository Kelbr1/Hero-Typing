#!/usr/bin/env bash

# Остановка фоновых процессов при завершении скрипта (Ctrl+C)
cleanup() {
    echo ""
    echo "Остановка сервисов..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM

echo "========================================================"
echo "   Печать героя - Тренажёр слепой печати с геймификацией"
echo "   Хакатон «Киберрывок 2026»"
echo "========================================================"
echo ""

# Проверка Python
if ! command -v python3 &> /dev/null; then
    echo "[ОШИБКА] python3 не найден. Установите Python 3.10+."
    exit 1
fi

# Проверка Node.js
if ! command -v node &> /dev/null; then
    echo "[ОШИБКА] node не найден. Установите Node.js 18+."
    exit 1
fi

echo "[1/3] Проверка зависимостей Backend..."
python3 -m pip install -r backend/requirements.txt > /dev/null 2>&1

echo "[2/3] Проверка зависимостей Frontend..."
if [ ! -d "frontend/node_modules" ]; then
    echo "Установка npm пакетов..."
    (cd frontend && npm install)
fi

echo "[3/3] Запуск Backend и Frontend..."
echo ""
echo "Запуск Backend API на http://127.0.0.1:8000..."
python3 -m uvicorn main:app --app-dir backend --reload --port 8000 &
BACKEND_PID=$!

sleep 2

echo "Запуск Frontend на http://localhost:3000..."
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    open http://localhost:3000 &
fi

echo ""
echo "========================================================"
echo "   Сервисы запущены:"
echo "   - Frontend:    http://localhost:3000"
echo "   - Backend API: http://127.0.0.1:8000"
echo "   - Swagger UI:  http://127.0.0.1:8000/docs"
echo "========================================================"
echo "Нажмите Ctrl+C для остановки обоих серверов."
echo ""

cd frontend && npm run dev
