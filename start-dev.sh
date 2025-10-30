#!/bin/bash

echo "🚀 Запуск Asian Goods Store - Development Mode"
echo

echo "📦 Установка зависимостей backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей backend"
    exit 1
fi

echo
echo "🗄️ Инициализация базы данных..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "❌ Ошибка инициализации базы данных"
    exit 1
fi

echo
echo "🔧 Запуск backend сервера в фоне..."
npm run dev &
BACKEND_PID=$!

echo
echo "⏳ Ожидание запуска backend сервера..."
sleep 3

echo
echo "📦 Установка зависимостей frontend..."
cd ..
npm install
if [ $? -ne 0 ]; then
    echo "❌ Ошибка установки зависимостей frontend"
    kill $BACKEND_PID
    exit 1
fi

echo
echo "🎨 Запуск frontend сервера..."
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Оба сервера запущены!"
echo
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:3001"
echo "📊 Health Check: http://localhost:3001/api/health"
echo
echo "Нажмите Ctrl+C для остановки всех серверов..."

# Функция для корректного завершения
cleanup() {
    echo
    echo "🛑 Остановка серверов..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Перехватываем сигнал завершения
trap cleanup SIGINT SIGTERM

# Ждем завершения
wait


