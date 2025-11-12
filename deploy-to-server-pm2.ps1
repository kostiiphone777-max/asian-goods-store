# PowerShell скрипт для развертывания на сервер с PM2

$ErrorActionPreference = "Stop"

Write-Host "🚀 Скрипт развертывания Asian Goods Store (PM2)" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Параметры сервера
$SERVER_IP = "45.141.78.168"
$SERVER_USER = "root"
$SERVER_PATH = "/opt/asian-goods-store"

Write-Host "📋 Параметры:" -ForegroundColor Yellow
Write-Host "   Сервер: $SERVER_USER@$SERVER_IP"
Write-Host "   Путь: $SERVER_PATH"
Write-Host ""

# Проверка SSH
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ SSH не установлен" -ForegroundColor Red
    Write-Host "   Установите OpenSSH Client через настройки Windows" -ForegroundColor Yellow
    exit 1
}

Write-Host "🔍 Проверка подключения к серверу..." -ForegroundColor Yellow
$connection = ssh -o ConnectTimeout=5 $SERVER_USER@$SERVER_IP "echo 'OK'" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Не удалось подключиться к серверу" -ForegroundColor Red
    Write-Host "   Проверьте доступность сервера и SSH ключи" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Подключение установлено" -ForegroundColor Green
Write-Host ""

# Меню
Write-Host "Выберите действие:" -ForegroundColor Cyan
Write-Host "1) Полное развертывание (загрузить код + установить + запустить)"
Write-Host "2) Только загрузить код"
Write-Host "3) Обновить и перезапустить (после загрузки кода)"
Write-Host "4) Проверить статус PM2"
Write-Host "5) Просмотреть логи"
Write-Host "6) Перезапустить приложение"
Write-Host "7) Создать backup базы данных"
Write-Host "0) Выход"
Write-Host ""

$action = Read-Host "Введите номер"

switch ($action) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Полное развертывание..." -ForegroundColor Cyan
        Write-Host ""
        
        # Шаг 1: Создание директории
        Write-Host "📁 Создание директории на сервере..." -ForegroundColor Yellow
        ssh $SERVER_USER@$SERVER_IP "mkdir -p $SERVER_PATH/logs"
        
        # Шаг 2: Создание архива
        Write-Host "📦 Создание архива проекта..." -ForegroundColor Yellow
        $tempArchive = "$env:TEMP\asian-goods-deploy.tar.gz"
        
        if (Get-Command tar -ErrorAction SilentlyContinue) {
            Write-Host "   Архивирование..." -ForegroundColor Gray
            
            tar -czf $tempArchive `
                --exclude=node_modules `
                --exclude=.next `
                --exclude=backend/node_modules `
                --exclude=backend/uploads/* `
                --exclude=backend/database/store.db `
                --exclude=backend/database/*.db `
                --exclude=backend/database/*.sqlite `
                --exclude=backend/database/schema.sql `
                --exclude=.git `
                --exclude=logs `
                *
            
            Write-Host "✅ Архив создан" -ForegroundColor Green
            
            # Шаг 3: Загрузка
            Write-Host "📤 Загрузка на сервер..." -ForegroundColor Yellow
            scp $tempArchive "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/deploy.tar.gz"
            
            Write-Host "📂 Распаковка..." -ForegroundColor Yellow
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
            
            Remove-Item $tempArchive -ErrorAction SilentlyContinue
            Write-Host "✅ Код загружен" -ForegroundColor Green
        } else {
            Write-Host "⚠️  tar не найден, копируем файлы напрямую..." -ForegroundColor Yellow
            
            # Копируем основные файлы и директории
            Write-Host "   Загрузка backend..." -ForegroundColor Gray
            scp -r .\backend\* "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/backend/" 2>$null
            
            Write-Host "   Загрузка frontend..." -ForegroundColor Gray
            scp -r .\app "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp -r .\components "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp -r .\lib "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp -r .\public "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            
            Write-Host "   Загрузка конфигурационных файлов..." -ForegroundColor Gray
            scp .\package.json "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp .\next.config.mjs "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp .\tsconfig.json "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            scp .\ecosystem.config.js "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/" 2>$null
            
            Write-Host "✅ Файлы загружены" -ForegroundColor Green
        }
        
        # Шаг 4: Проверка .env и удаление SQLite файлов
        Write-Host ""
        Write-Host "🔍 Проверка конфигурации..." -ForegroundColor Yellow
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH

# Удаляем старые SQLite файлы если есть
if [ -f backend/database/store.db ]; then
    echo '🗑️  Удаление старого SQLite файла...'
    rm -f backend/database/store.db
    echo '✅ SQLite файл удален'
fi

if [ -f backend/database/schema.sql ]; then
    echo '🗑️  Удаление старого SQLite schema...'
    rm -f backend/database/schema.sql
    echo '✅ SQLite schema удален'
fi

# Проверяем .env для Postgres
if [ ! -f backend/.env ]; then
    echo '⚠️  backend/.env не найден! Создаем из примера...'
    cp backend/env.example backend/.env
    echo '⚠️  ВАЖНО: Отредактируйте backend/.env и установите:'
    echo '   - JWT_SECRET'
    echo '   - FRONTEND_URL=http://45.141.78.168'
    echo '   - PORT=3001'
    echo '   - PostgreSQL настройки (PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD)'
else
    echo '✅ backend/.env найден'
    # Проверяем, что используется Postgres
    if ! grep -q 'PGHOST\|POSTGRES_URL\|DATABASE_URL' backend/.env; then
        echo '⚠️  ВАЖНО: Убедитесь, что в backend/.env настроен PostgreSQL!'
    fi
fi

if [ ! -f .env.local ]; then
    echo '⚠️  .env.local не найден! Создаем...'
    echo 'NEXT_PUBLIC_API_URL=http://45.141.78.168:3001/api' > .env.local
    echo '✅ .env.local создан'
else
    echo '✅ .env.local найден'
fi
"@
        
        # Шаг 5: Установка зависимостей
        Write-Host ""
        Write-Host "📦 Установка зависимостей..." -ForegroundColor Yellow
        Write-Host "   (это может занять несколько минут)" -ForegroundColor Gray
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
echo '📦 Frontend зависимости...'
npm install --production=false

echo '📦 Backend зависимости...'
cd backend && npm install && cd ..

echo '🔨 Сборка frontend...'
npm run build

echo '✅ Зависимости установлены и проект собран'
"@
        
        # Шаг 6: Проверка PostgreSQL и запуск PM2
        Write-Host ""
        Write-Host "🔍 Проверка PostgreSQL..." -ForegroundColor Yellow
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH

# Проверяем подключение к PostgreSQL
echo 'Проверка подключения к PostgreSQL...'
if command -v psql &> /dev/null; then
    # Пытаемся подключиться (читаем настройки из .env)
    source backend/.env 2>/dev/null || true
    if psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT 1;' &>/dev/null; then
        echo '✅ PostgreSQL доступен'
    else
        echo '⚠️  Не удалось подключиться к PostgreSQL'
        echo '   Проверьте настройки в backend/.env'
    fi
else
    echo '⚠️  psql не найден, пропускаем проверку'
fi
"@
        
        Write-Host ""
        Write-Host "🚀 Запуск с PM2..." -ForegroundColor Yellow
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH

# Остановим старые процессы (если есть)
pm2 delete all 2>/dev/null || true

# Запустим новые
pm2 start ecosystem.config.js

# Сохраним конфигурацию
pm2 save

# Настроим автозапуск (если еще не настроен)
pm2 startup 2>/dev/null || true

echo ''
echo '📊 Статус процессов:'
pm2 status
"@
        
        Write-Host ""
        Write-Host "✅ Развертывание завершено!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🌐 Проверьте:" -ForegroundColor Cyan
        Write-Host "   Сайт: http://45.141.78.168:3000" -ForegroundColor White
        Write-Host "   API: http://45.141.78.168:3001/api/health" -ForegroundColor White
        Write-Host "   Админ: http://45.141.78.168:3000/admin" -ForegroundColor White
        Write-Host ""
        Write-Host "📝 Следующие шаги:" -ForegroundColor Yellow
        Write-Host "   1. Проверьте backend/.env на сервере"
        Write-Host "   2. Настройте Telegram бота в админ-панели"
        Write-Host "   3. Настройте Nginx для работы на порту 80 (опционально)"
    }
    
    "2" {
        Write-Host ""
        Write-Host "📤 Загрузка кода на сервер..." -ForegroundColor Yellow
        
        $tempArchive = "$env:TEMP\asian-goods-deploy.tar.gz"
        
        if (Get-Command tar -ErrorAction SilentlyContinue) {
            tar -czf $tempArchive `
                --exclude=node_modules `
                --exclude=.next `
                --exclude=backend/node_modules `
                --exclude=backend/database/store.db `
                --exclude=backend/database/*.db `
                --exclude=backend/database/*.sqlite `
                --exclude=backend/database/schema.sql `
                --exclude=.git `
                --exclude=logs `
                *
                
            scp $tempArchive "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/deploy.tar.gz"
            ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
            Remove-Item $tempArchive
            
            Write-Host "✅ Код загружен" -ForegroundColor Green
            Write-Host "   Теперь выполните пункт 3 для обновления и перезапуска" -ForegroundColor Yellow
        } else {
            Write-Host "⚠️  Используйте tar или загрузите файлы вручную через WinSCP" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔄 Обновление и перезапуск..." -ForegroundColor Yellow
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH

# Удаляем старые SQLite файлы если есть
if [ -f backend/database/store.db ]; then
    echo '🗑️  Удаление старого SQLite файла...'
    rm -f backend/database/store.db
fi

echo '📦 Установка зависимостей...'
npm install --production=false
cd backend && npm install && cd ..

echo '🔨 Сборка frontend...'
npm run build

echo '🔍 Проверка PostgreSQL...'
source backend/.env 2>/dev/null || true
if command -v psql &> /dev/null; then
    if psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT 1;' &>/dev/null; then
        echo '✅ PostgreSQL доступен'
    else
        echo '⚠️  Не удалось подключиться к PostgreSQL'
    fi
fi

echo '🔄 Перезапуск PM2...'
pm2 restart all

echo ''
echo '✅ Обновление завершено'
echo ''
echo '📊 Статус:'
pm2 status
"@
        
        Write-Host ""
        Write-Host "✅ Приложение обновлено и перезапущено" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "📊 Статус PM2 процессов:" -ForegroundColor Cyan
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 status"
        
        Write-Host ""
        Write-Host "🔍 Проверка API:" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "http://$SERVER_IP`:3001/api/health" -Method Get -TimeoutSec 5
            Write-Host "✅ API работает" -ForegroundColor Green
            Write-Host ($response | ConvertTo-Json)
        } catch {
            Write-Host "❌ API не отвечает" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host ""
        Write-Host "📋 Логи (нажмите Ctrl+C для выхода):" -ForegroundColor Cyan
        Write-Host ""
        
        Write-Host "Выберите логи:" -ForegroundColor Yellow
        Write-Host "1) Все логи"
        Write-Host "2) Backend"
        Write-Host "3) Frontend"
        $logChoice = Read-Host "Номер"
        
        switch ($logChoice) {
            "1" { ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs --lines 50" }
            "2" { ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs asian-goods-backend --lines 50" }
            "3" { ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs asian-goods-frontend --lines 50" }
            default { Write-Host "Неверный выбор" -ForegroundColor Red }
        }
    }
    
    "6" {
        Write-Host ""
        Write-Host "🔄 Перезапуск приложения..." -ForegroundColor Yellow
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
pm2 restart all
echo ''
pm2 status
"@
        
        Write-Host "✅ Приложение перезапущено" -ForegroundColor Green
    }
    
    "7" {
        Write-Host ""
        Write-Host "💾 Создание backup PostgreSQL базы данных..." -ForegroundColor Yellow
        
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $backupName = "postgres_backup_$timestamp.sql"
        
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH

# Читаем настройки из .env
source backend/.env 2>/dev/null || true

# Создаем backup PostgreSQL
if command -v pg_dump &> /dev/null; then
    echo 'Создание backup PostgreSQL...'
    pg_dump -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} > backend/database/$backupName
    echo 'Backup создан: $backupName'
else
    echo '❌ pg_dump не найден. Установите PostgreSQL клиент.'
    exit 1
fi
"@
        
        Write-Host "📥 Скачивание backup..." -ForegroundColor Yellow
        $backupDir = ".\backups"
        if (-not (Test-Path $backupDir)) {
            New-Item -ItemType Directory -Path $backupDir | Out-Null
        }
        
        scp "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/backend/database/$backupName" "$backupDir\"
        
        Write-Host "✅ Backup сохранен: $backupDir\$backupName" -ForegroundColor Green
        Write-Host "   Для восстановления используйте: psql -h HOST -U USER -d DATABASE < $backupName" -ForegroundColor Gray
    }
    
    "0" {
        Write-Host "Выход..." -ForegroundColor Gray
        exit 0
    }
    
    default {
        Write-Host "❌ Неверный выбор" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Готово!" -ForegroundColor Green

