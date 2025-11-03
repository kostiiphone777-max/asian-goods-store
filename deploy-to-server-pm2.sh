#!/bin/bash
# Скрипт для развертывания на сервер с PM2

set -e

echo "🚀 Скрипт развертывания Asian Goods Store (PM2)"
echo "=============================================="
echo ""

# Параметры
SERVER_IP="45.141.78.168"
SERVER_USER="root"
SERVER_PATH="/opt/asian-goods-store"

echo "📋 Параметры:"
echo "   Сервер: $SERVER_USER@$SERVER_IP"
echo "   Путь: $SERVER_PATH"
echo ""

# Проверка подключения
echo "🔍 Проверка подключения..."
if ! ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'OK'" >/dev/null 2>&1; then
    echo "❌ Не удалось подключиться к серверу"
    exit 1
fi
echo "✅ Подключение установлено"
echo ""

# Меню
echo "Выберите действие:"
echo "1) Полное развертывание"
echo "2) Только загрузить код"
echo "3) Обновить и перезапустить"
echo "4) Проверить статус"
echo "5) Просмотреть логи"
echo "6) Перезапустить"
echo "7) Создать backup"
echo "0) Выход"
echo ""

read -p "Введите номер: " action

case $action in
    1)
        echo ""
        echo "🚀 Полное развертывание..."
        
        # Создать директорию
        echo "📁 Создание директории..."
        ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH/logs"
        
        # Загрузить код
        echo "📤 Загрузка кода..."
        rsync -avz --exclude 'node_modules' \
                   --exclude '.next' \
                   --exclude 'backend/node_modules' \
                   --exclude 'backend/uploads/*' \
                   --exclude 'backend/database/store.db' \
                   --exclude '.git' \
                   --exclude 'logs' \
                   ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
        
        echo "✅ Код загружен"
        
        # Проверить .env
        echo ""
        echo "🔍 Проверка конфигурации..."
        ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/asian-goods-store

if [ ! -f backend/.env ]; then
    echo "⚠️  backend/.env не найден! Создаем из примера..."
    cp backend/env.example backend/.env
    echo "⚠️  ВАЖНО: Отредактируйте backend/.env"
else
    echo "✅ backend/.env найден"
fi

if [ ! -f .env.local ]; then
    echo "⚠️  .env.local не найден! Создаем..."
    echo "NEXT_PUBLIC_API_URL=http://45.141.78.168:3001/api" > .env.local
    echo "✅ .env.local создан"
else
    echo "✅ .env.local найден"
fi
EOF
        
        # Установить зависимости
        echo ""
        echo "📦 Установка зависимостей..."
        ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/asian-goods-store

echo "📦 Frontend зависимости..."
npm install --production=false

echo "📦 Backend зависимости..."
cd backend && npm install && cd ..

echo "🔨 Сборка frontend..."
npm run build

echo "✅ Зависимости установлены"
EOF
        
        # Запустить PM2
        echo ""
        echo "🚀 Запуск с PM2..."
        ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/asian-goods-store

# Остановить старые процессы
pm2 delete all 2>/dev/null || true

# Запустить новые
pm2 start ecosystem.config.js

# Сохранить
pm2 save

# Автозапуск
pm2 startup 2>/dev/null || true

echo ""
echo "📊 Статус:"
pm2 status
EOF
        
        echo ""
        echo "✅ Развертывание завершено!"
        echo ""
        echo "🌐 Проверьте:"
        echo "   Сайт: http://45.141.78.168:3000"
        echo "   API: http://45.141.78.168:3001/api/health"
        echo "   Админ: http://45.141.78.168:3000/admin"
        ;;
        
    2)
        echo ""
        echo "📤 Загрузка кода..."
        rsync -avz --exclude 'node_modules' \
                   --exclude '.next' \
                   --exclude 'backend/node_modules' \
                   ./ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
        echo "✅ Код загружен"
        ;;
        
    3)
        echo ""
        echo "🔄 Обновление и перезапуск..."
        ssh $SERVER_USER@$SERVER_IP << 'EOF'
cd /opt/asian-goods-store

echo "📦 Установка зависимостей..."
npm install --production=false
cd backend && npm install && cd ..

echo "🔨 Сборка..."
npm run build

echo "🔄 Перезапуск..."
pm2 restart all

echo ""
pm2 status
EOF
        echo "✅ Обновлено"
        ;;
        
    4)
        echo ""
        echo "📊 Статус PM2:"
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 status"
        
        echo ""
        echo "🔍 API Health:"
        curl -s http://$SERVER_IP:3001/api/health | jq . || curl -s http://$SERVER_IP:3001/api/health
        ;;
        
    5)
        echo ""
        echo "📋 Логи (Ctrl+C для выхода):"
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs --lines 50"
        ;;
        
    6)
        echo ""
        echo "🔄 Перезапуск..."
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 restart all && pm2 status"
        echo "✅ Перезапущено"
        ;;
        
    7)
        echo ""
        echo "💾 Создание backup..."
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S).db"
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH/backend/database && cp store.db $BACKUP_NAME"
        
        mkdir -p ./backups
        scp $SERVER_USER@$SERVER_IP:$SERVER_PATH/backend/database/$BACKUP_NAME ./backups/
        
        echo "✅ Backup сохранен: ./backups/$BACKUP_NAME"
        ;;
        
    0)
        echo "Выход..."
        exit 0
        ;;
        
    *)
        echo "❌ Неверный выбор"
        exit 1
        ;;
esac

echo ""
echo "✅ Готово!"

