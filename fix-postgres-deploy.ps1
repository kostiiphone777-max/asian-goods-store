# Скрипт для диагностики и исправления проблем с PostgreSQL на сервере

$ErrorActionPreference = "Stop"

Write-Host "🔍 Диагностика и исправление проблем с PostgreSQL" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$SERVER_IP = "45.141.78.168"
$SERVER_USER = "root"
$SERVER_PATH = "/opt/asian-goods-store"

Write-Host "📋 Параметры:" -ForegroundColor Yellow
Write-Host "   Сервер: $SERVER_USER@$SERVER_IP"
Write-Host "   Путь: $SERVER_PATH"
Write-Host ""

# Шаг 1: Проверка логов backend
Write-Host "📋 ШАГ 1: Проверка логов backend..." -ForegroundColor Yellow
Write-Host ""
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs asian-goods-backend --err --lines 30 --nostream"
Write-Host ""

# Шаг 2: Проверка .env файла
Write-Host "📋 ШАГ 2: Проверка конфигурации .env..." -ForegroundColor Yellow
Write-Host ""
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && cat backend/.env | grep -E 'PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|POSTGRES_URL|DATABASE_URL' || echo '⚠️  PostgreSQL настройки не найдены в .env'"
Write-Host ""

# Шаг 3: Проверка подключения к PostgreSQL
Write-Host "📋 ШАГ 3: Проверка подключения к PostgreSQL..." -ForegroundColor Yellow
Write-Host ""
ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
source backend/.env 2>/dev/null || true

if command -v psql &> /dev/null; then
    echo 'Проверка подключения к PostgreSQL...'
    if psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT version();' 2>&1; then
        echo ''
        echo '✅ PostgreSQL доступен'
        echo ''
        echo 'Проверка существования базы данных:'
        psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c '\dt' 2>&1 | head -20
    else
        echo '❌ Не удалось подключиться к PostgreSQL'
        echo 'Проверьте настройки в backend/.env'
    fi
else
    echo '⚠️  psql не найден'
fi
"@
Write-Host ""

# Шаг 4: Проверка наличия данных
Write-Host "📋 ШАГ 4: Проверка данных в базе..." -ForegroundColor Yellow
Write-Host ""
ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
source backend/.env 2>/dev/null || true

if command -v psql &> /dev/null; then
    echo 'Проверка таблиц и данных:'
    echo ''
    echo 'Таблица users:'
    psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT COUNT(*) as user_count FROM users;' 2>&1 || echo 'Таблица users не существует'
    echo ''
    echo 'Таблица products:'
    psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT COUNT(*) as product_count FROM products;' 2>&1 || echo 'Таблица products не существует'
    echo ''
    echo 'Таблица categories:'
    psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -c 'SELECT COUNT(*) as category_count FROM categories;' 2>&1 || echo 'Таблица categories не существует'
else
    echo '⚠️  psql не найден'
fi
"@
Write-Host ""

# Шаг 5: Проверка наличия SQLite файла для миграции
Write-Host "📋 ШАГ 5: Проверка наличия старой SQLite базы..." -ForegroundColor Yellow
Write-Host ""
ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
if [ -f backend/database/store.db ]; then
    echo '✅ SQLite база найдена: backend/database/store.db'
    echo '   Размер:'
    ls -lh backend/database/store.db
    echo ''
    echo '   Можно выполнить миграцию данных'
else
    echo '⚠️  SQLite база не найдена'
    echo '   Если данные были в SQLite, они могли быть удалены'
fi
"@
Write-Host ""

# Меню действий
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Выберите действие:" -ForegroundColor Cyan
Write-Host "1) Применить схему PostgreSQL (создать таблицы)"
Write-Host "2) Выполнить миграцию данных из SQLite (если есть)"
Write-Host "3) Перезапустить backend"
Write-Host "4) Просмотреть полные логи backend"
Write-Host "5) Проверить статус PM2"
Write-Host "0) Выход"
Write-Host ""

$action = Read-Host "Введите номер"

switch ($action) {
    "1" {
        Write-Host ""
        Write-Host "📋 Применение схемы PostgreSQL..." -ForegroundColor Yellow
        ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
source backend/.env 2>/dev/null || true

if [ -f backend/database/schema.postgres.sql ]; then
    echo 'Применение схемы...'
    psql -h \${PGHOST:-localhost} -U \${PGUSER:-postgres} -d \${PGDATABASE:-postgres} -f backend/database/schema.postgres.sql
    echo '✅ Схема применена'
else
    echo '❌ Файл schema.postgres.sql не найден'
fi
"@
    }
    
    "2" {
        Write-Host ""
        Write-Host "📋 Миграция данных из SQLite в PostgreSQL..." -ForegroundColor Yellow
        
        # Проверяем наличие SQLite файла
        $hasSqlite = ssh $SERVER_USER@$SERVER_IP "test -f $SERVER_PATH/backend/database/store.db && echo 'yes' || echo 'no'"
        
        if ($hasSqlite -eq "yes") {
            Write-Host "   SQLite база найдена, начинаем миграцию..." -ForegroundColor Gray
            ssh $SERVER_USER@$SERVER_IP @"
cd $SERVER_PATH
source backend/.env 2>/dev/null || true

# Проверяем наличие скрипта миграции
if [ -f backend/scripts/migrate-sqlite-to-postgres.js ]; then
    echo 'Запуск миграции...'
    cd backend
    node scripts/migrate-sqlite-to-postgres.js
    echo '✅ Миграция завершена'
else
    echo '❌ Скрипт миграции не найден: backend/scripts/migrate-sqlite-to-postgres.js'
fi
"@
        } else {
            Write-Host "❌ SQLite база не найдена на сервере" -ForegroundColor Red
            Write-Host "   Миграция невозможна" -ForegroundColor Yellow
        }
    }
    
    "3" {
        Write-Host ""
        Write-Host "🔄 Перезапуск backend..." -ForegroundColor Yellow
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 restart asian-goods-backend"
        Write-Host ""
        Start-Sleep -Seconds 3
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 status"
        Write-Host ""
        Write-Host "✅ Backend перезапущен" -ForegroundColor Green
    }
    
    "4" {
        Write-Host ""
        Write-Host "📋 Полные логи backend (Ctrl+C для выхода):" -ForegroundColor Cyan
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs asian-goods-backend --lines 100"
    }
    
    "5" {
        Write-Host ""
        Write-Host "📊 Статус PM2:" -ForegroundColor Cyan
        ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 status"
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

