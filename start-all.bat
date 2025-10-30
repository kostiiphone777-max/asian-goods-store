@echo off
chcp 65001 >nul
echo 🚀 Запуск Asian Goods Store - Все в одном окне
echo.

echo 📦 Проверка и установка зависимостей...
if not exist backend\node_modules (
    echo Установка зависимостей backend...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ❌ Ошибка установки backend
        pause
        exit /b 1
    )
    cd ..
)

if not exist node_modules (
    echo Установка зависимостей frontend...
    call npm install --legacy-peer-deps
    if errorlevel 1 (
        echo ❌ Ошибка установки frontend
        pause
        exit /b 1
    )
)

echo.
echo 🗄️ Проверка базы данных...
if not exist backend\data\products.json (
    echo Инициализация базы данных...
    cd backend
    call npm run init-db
    if errorlevel 1 (
        echo ❌ Ошибка инициализации БД
        pause
        exit /b 1
    )
    cd ..
)

echo.
echo 🔧 Запуск backend сервера в фоне...
cd backend
start /b npm run dev
cd ..

echo.
echo ⏳ Ожидание запуска backend (3 сек)...
timeout /t 3 /nobreak > nul

echo.
echo 🎨 Запуск frontend сервера...
echo.
echo ✅ Серверы запущены!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🔧 Backend:  http://localhost:3001
echo 📊 Health:   http://localhost:3001/api/health
echo.
echo Нажмите Ctrl+C для остановки всех серверов...
echo.

npm run dev


