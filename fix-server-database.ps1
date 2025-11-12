# Скрипт для исправления проблемы с database.js на сервере

$ErrorActionPreference = "Stop"

Write-Host "Исправление проблемы с database.js на сервере" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

$SERVER_IP = "45.141.78.168"
$SERVER_USER = "root"
$SERVER_PATH = "/opt/asian-goods-store"

Write-Host "Проблема: Backend пытается открыть schema.sql (старый SQLite файл)" -ForegroundColor Yellow
Write-Host "Решение: Обновим database.js и убедимся, что используется PostgreSQL" -ForegroundColor Yellow
Write-Host ""

# Шаг 1: Проверка текущего database.js на сервере
Write-Host "ШАГ 1: Проверка текущего database.js на сервере..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && head -40 backend/database/database.js"
Write-Host ""

# Шаг 2: Загрузка правильного database.js
Write-Host "ШАГ 2: Загрузка правильного database.js..." -ForegroundColor Yellow
scp backend/database/database.js "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/backend/database/database.js"
Write-Host "[OK] database.js обновлен" -ForegroundColor Green
Write-Host ""

# Шаг 3: Проверка наличия schema.postgres.sql
Write-Host "ШАГ 3: Проверка наличия schema.postgres.sql..." -ForegroundColor Yellow
$schemaExists = ssh $SERVER_USER@$SERVER_IP "test -f $SERVER_PATH/backend/database/schema.postgres.sql && echo 'yes' || echo 'no'"

if ($schemaExists -eq "no") {
    Write-Host "[!] schema.postgres.sql не найден, загружаю..." -ForegroundColor Yellow
    scp backend/database/schema.postgres.sql "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/backend/database/schema.postgres.sql"
    Write-Host "[OK] schema.postgres.sql загружен" -ForegroundColor Green
} else {
    Write-Host "[OK] schema.postgres.sql существует" -ForegroundColor Green
}
Write-Host ""

# Шаг 4: Проверка наличия postgres.js
Write-Host "ШАГ 4: Проверка наличия postgres.js..." -ForegroundColor Yellow
$postgresExists = ssh $SERVER_USER@$SERVER_IP "test -f $SERVER_PATH/backend/database/postgres.js && echo 'yes' || echo 'no'"

if ($postgresExists -eq "no") {
    Write-Host "[!] postgres.js не найден, загружаю..." -ForegroundColor Yellow
    scp backend/database/postgres.js "$SERVER_USER@$SERVER_IP`:$SERVER_PATH/backend/database/postgres.js"
    Write-Host "[OK] postgres.js загружен" -ForegroundColor Green
} else {
    Write-Host "[OK] postgres.js существует" -ForegroundColor Green
}
Write-Host ""

# Шаг 5: Удаление старого schema.sql если есть
Write-Host "ШАГ 5: Удаление старого schema.sql (если есть)..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && rm -f backend/database/schema.sql && echo '[OK] Старый schema.sql удален (если был)' || echo '[OK] Старого schema.sql не было'"
Write-Host ""

# Шаг 6: Проверка .env
Write-Host "ШАГ 6: Проверка настроек PostgreSQL в .env..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && cat backend/.env | grep -E 'PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD|POSTGRES_URL' || echo '[!] PostgreSQL настройки не найдены'"
Write-Host ""

# Шаг 7: Перезапуск backend
Write-Host "ШАГ 7: Перезапуск backend..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 restart asian-goods-backend"
Write-Host ""

# Ждем немного
Start-Sleep -Seconds 3

# Шаг 8: Проверка статуса
Write-Host "ШАГ 8: Проверка статуса..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 status"
Write-Host ""

# Шаг 9: Проверка логов
Write-Host "ШАГ 9: Проверка последних логов..." -ForegroundColor Yellow
ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && pm2 logs asian-goods-backend --lines 10 --nostream"
Write-Host ""

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "[OK] Исправление завершено!" -ForegroundColor Green
Write-Host ""
Write-Host "Проверьте:" -ForegroundColor Yellow
Write-Host "  1. pm2 status - backend должен быть 'online' (зеленый)" -ForegroundColor White
Write-Host "  2. pm2 logs asian-goods-backend - не должно быть ошибок" -ForegroundColor White
Write-Host "  3. curl http://45.141.78.168:3001/api/health - должен вернуть OK" -ForegroundColor White
Write-Host ""

