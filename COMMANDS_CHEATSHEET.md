# ⚡ Шпаргалка команд - Copy & Paste

## 🔐 Подключение

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
```

---

## 📊 Проверка статуса

```bash
pm2 status
```

---

## 📋 Просмотр логов

```bash
# Все логи
pm2 logs

# Только backend
pm2 logs asian-goods-backend

# Только frontend
pm2 logs asian-goods-frontend

# Последние 50 строк
pm2 logs --lines 50
```

---

## 🔄 Перезапуск

```bash
# Перезапустить всё
pm2 restart all

# Только backend
pm2 restart asian-goods-backend

# Только frontend
pm2 restart asian-goods-frontend
```

---

## 🔍 Проверка работы

```bash
# API health check
curl http://localhost:3001/api/health

# С красивым выводом (если установлен jq)
curl http://localhost:3001/api/health | jq .
```

---

## 📦 Обновление после изменений

```bash
cd /opt/asian-goods-store
git pull
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
pm2 logs --lines 20
```

---

## 💾 Backup базы данных (PostgreSQL)

```bash
# Дамп всей БД в файл (замените параметры при необходимости)
pg_dump -h localhost -p 5432 -U postgres -d magazin -F c -f backup_$(date +%Y%m%d_%H%M%S).dump

# Восстановление из дампа
pg_restore -h localhost -p 5432 -U postgres -d magazin --clean --if-exists backup_YYYYMMDD_HHMMSS.dump
```

---

## 🗄️ Работа с базой данных (PostgreSQL)

```bash
# Открыть psql-консоль
psql -h localhost -p 5432 -U postgres -d magazin
```

### Внутри psql:

```sql
-- Показать таблицы
\dt

-- Посмотреть последние заказы
SELECT orderNumber, status, total, createdAt 
FROM orders 
ORDER BY createdAt DESC 
LIMIT 5;

-- Включить Telegram уведомления
UPDATE telegram_settings SET "isEnabled" = true;

-- Выйти
\q
```

---

## 🆘 Решение проблем

### Backend не работает

```bash
# Посмотреть ошибки
pm2 logs asian-goods-backend --err --lines 50

# Проверить .env
cat backend/.env

# Проверить порт
netstat -tlnp | grep 3001

# Перезапустить
pm2 restart asian-goods-backend
```

### Frontend не работает

```bash
# Посмотреть ошибки
pm2 logs asian-goods-frontend --err --lines 50

# Пересобрать
npm run build

# Перезапустить
pm2 restart asian-goods-frontend
```

### Telegram не работает

```bash
# Проверить логи
pm2 logs asian-goods-backend | grep -i telegram

# Проверить настройки в БД
sqlite3 backend/database/store.db "SELECT * FROM telegram_settings;"

# Включить в БД
sqlite3 backend/database/store.db "UPDATE telegram_settings SET isEnabled = 1;"

# Перезапустить backend
pm2 restart asian-goods-backend
```

---

## 🔧 Nginx команды

```bash
# Проверить конфигурацию
nginx -t

# Перезапустить
systemctl restart nginx

# Статус
systemctl status nginx

# Логи
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 🧹 Очистка

```bash
# Очистить логи PM2
pm2 flush

# Очистить старые файлы логов
find logs/ -name "*.log" -mtime +7 -delete

# Пересобрать с чистого листа
rm -rf .next
npm run build
pm2 restart asian-goods-frontend
```

---

## 📊 Мониторинг системы

```bash
# Мониторинг PM2
pm2 monit

# Использование ресурсов
top

# Свободное место
df -h

# Память
free -h

# Открытые порты
netstat -tlnp | grep -E '3000|3001'
```

---

## 🚨 Экстренные команды

```bash
# Полный перезапуск
pm2 restart all

# Если PM2 завис
pm2 kill
pm2 start ecosystem.config.js
pm2 save

# Восстановить из Git
cd /opt/asian-goods-store
git reset --hard HEAD
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
```

---

## 🔐 Безопасность

```bash
# Настроить firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Проверить
ufw status

# Права на .env
chmod 600 backend/.env
```

---

## 📱 Проверка всего сразу

```bash
echo "=== PM2 ===" && pm2 status && \
echo -e "\n=== API ===" && curl -s http://localhost:3001/api/health && \
echo -e "\n=== Порты ===" && netstat -tlnp | grep -E '3000|3001' && \
echo -e "\n=== Диск ===" && df -h | grep -E 'Filesystem|/$' && \
echo -e "\n=== Память ===" && free -h
```

Сохраните как `check.sh`:

```bash
nano check.sh
# Вставьте команду выше
# Сохраните: Ctrl+O, Enter, Ctrl+X
chmod +x check.sh
./check.sh
```

---

## 🎯 Автоматизация

### Автоматический backup (ежедневно в 2:00)

```bash
crontab -e
```

Добавьте:

```
0 2 * * * cd /opt/asian-goods-store/backend/database && cp store.db backup_$(date +\%Y\%m\%d).db
```

### Автоочистка старых логов (каждое воскресенье)

```bash
crontab -e
```

Добавьте:

```
0 0 * * 0 find /opt/asian-goods-store/logs -name "*.log" -mtime +7 -delete
```

---

## 💡 Полезные алиасы

Добавьте в `~/.bashrc`:

```bash
nano ~/.bashrc
```

Вставьте в конец:

```bash
# Asian Goods Store aliases
alias ags='cd /opt/asian-goods-store'
alias ags-status='pm2 status'
alias ags-logs='pm2 logs'
alias ags-restart='pm2 restart all'
alias ags-health='curl http://localhost:3001/api/health | jq .'
```

Примените:

```bash
source ~/.bashrc
```

Теперь можно использовать:

```bash
ags              # перейти в проект
ags-status       # статус
ags-logs         # логи
ags-restart      # перезапуск
ags-health       # проверка API
```

---

**Сохраните эту шпаргалку! 📌**

