@echo off
chcp 65001 >nul
echo 🚀 Быстрое исправление Asian Goods Store
echo.

echo 📦 Установка frontend с исправлением конфликтов...
call npm install --legacy-peer-deps --force

if errorlevel 1 (
    echo.
    echo ❌ Ошибка установки. Попробуем альтернативный способ...
    echo.
    call install-fix.bat
) else (
    echo.
    echo ✅ Frontend установлен успешно!
    echo.
    echo 🚀 Запуск серверов...
    call start-dev.bat
)


