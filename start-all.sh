#!/bin/bash

echo "🚀 Запуск Asian Goods Store - Все в одном окне"
echo

# Установка зависимостей backend
if [ ! -d "backend/node_modules" ]; then
    echo "📦 Установка зависимостей backend..."
    cd backend
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки backend"
        exit 1
    fi
    cd ..
fi

# Установка зависимостей frontend
if [ ! -d "node_modules" ]; then
    echo "📦 Установка зависимостей frontend..."
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка установки frontend"
        exit 1
    fi
fi

# Инициализация базы данных
if [ ! -f "backend/data/products.json" ]; then
    echo "🗄️ Инициализация базы данных..."
    cd backend
    npm run init-db
    if [ $? -ne 0 ]; then
        echo "❌ Ошибка инициализации БД"
        exit 1
    fi
    cd ..
fi

echo
echo "🔧 Запуск backend сервера в фоне..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

echo
echo "⏳ Ожидание запуска backend (3 сек)..."
sleep 3

echo
echo "🎨 Запуск frontend сервера..."
echo
echo "✅ Серверы запущены!"
echo
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:3001"
echo "📊 Health:   http://localhost:3001/api/health"
echo
echo "Нажмите Ctrl+C для остановки всех серверов..."
echo

# Функция для корректного завершения
cleanup() {
    echo
    echo "🛑 Остановка серверов..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Перехватываем сигнал завершения
trap cleanup SIGINT SIGTERM

# Запускаем frontend в основном процессе
npm run dev


