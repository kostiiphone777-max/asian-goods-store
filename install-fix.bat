@echo off
chcp 65001 >nul
echo 🔧 Исправление установки Asian Goods Store
echo.

echo 📦 Очистка кэша npm...
call npm cache clean --force

echo.
echo 🗑️ Удаление node_modules и package-lock.json...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
if exist backend\node_modules rmdir /s /q backend\node_modules
if exist backend\package-lock.json del backend\package-lock.json

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
echo 📦 Установка зависимостей frontend с исправлением конфликтов...
cd ..
call npm install --legacy-peer-deps --force
if errorlevel 1 (
    echo ❌ Ошибка установки зависимостей frontend
    echo Попробуйте запустить: npm install --legacy-peer-deps
    pause
    exit /b 1
)

echo.
echo ✅ Установка завершена успешно!
echo.
echo 🚀 Теперь можно запустить:
echo   npm run dev:full
echo.
echo Или по отдельности:
echo   Backend:  npm run backend:dev
echo   Frontend: npm run dev
echo.
pause


