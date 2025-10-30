@echo off
chcp 65001 >nul
echo 🚀 Запуск Asian Goods Store - Development Mode
echo.

echo 📦 Установка зависимостей backend...
cd backend
call npm install
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей backend
    pause
    exit /b 1
)

echo.
echo 🗄️ Инициализация базы данных...
call npm run init-db
if errorlevel 1 (
    echo ❌ Ошибка инициализации базы данных
    pause
    exit /b 1
)

echo.
echo 🔧 Запуск backend сервера...
start "Backend Server" cmd /k "npm run dev"

echo.
echo ⏳ Ожидание запуска backend сервера...
timeout /t 3 /nobreak > nul

echo.
echo 📦 Установка зависимостей frontend...
cd ..
call npm install --legacy-peer-deps
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей frontend
    pause
    exit /b 1
)

echo.
echo 🎨 Запуск frontend сервера...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo ✅ Оба сервера запущены!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo 📊 Health Check: http://localhost:3001/api/health
echo.
echo Нажмите любую клавишу для выхода...
pause >nul
