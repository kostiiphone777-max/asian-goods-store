# 🚀 Шпаргалка PM2 команд для Asian Goods Store

Быстрый справочник команд для управления приложением на сервере 45.141.78.168

---

## 🔐 Подключение к серверу

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
```

---

## 🎯 Основные PM2 команды

### Статус и мониторинг

```bash
# Статус всех процессов
pm2 status
pm2 ls

# Детальная информация о процессе
pm2 show asian-goods-backend
pm2 show asian-goods-frontend

# Информация обо всех процессах
pm2 show all

# Мониторинг в реальном времени (CPU, Memory)
pm2 monit

# Список процессов с деталями
pm2 list
```

### Запуск и остановка

```bash
# Запустить приложение
pm2 start ecosystem.config.js

# Остановить все процессы
pm2 stop all

# Остановить конкретный процесс
pm2 stop asian-goods-backend
pm2 stop asian-goods-frontend

# Запустить остановленный процесс
pm2 start asian-goods-backend

# Перезапустить все
pm2 restart all

# Перезапустить конкретный процесс
pm2 restart asian-goods-backend

# Перезагрузка с нулевым downtime (для кластера)
pm2 reload asian-goods-backend

# Удалить процесс из списка PM2
pm2 delete asian-goods-backend
pm2 delete all
```

### Логи

```bash
# Все логи в реальном времени
pm2 logs

# Логи конкретного процесса
pm2 logs asian-goods-backend
pm2 logs asian-goods-frontend

# Последние N строк
pm2 logs --lines 100
pm2 logs asian-goods-backend --lines 50

# Только новые логи (без истории)
pm2 logs --raw

# Логи с фильтром по времени
pm2 logs --since 1h        # За последний час
pm2 logs --since 30m       # За последние 30 минут

# Очистить все логи
pm2 flush

# Очистить логи конкретного процесса
pm2 flush asian-goods-backend

# Просмотр файлов логов напрямую
tail -f logs/backend-out.log
tail -f logs/backend-error.log
tail -f logs/frontend-out.log
```

---

## 📁 Файлы логов

Логи хранятся в директории проекта:

```bash
cd /opt/asian-goods-store/logs

# Структура:
# backend-out.log       - stdout backend
# backend-error.log     - stderr backend
# backend-combined.log  - объединенные логи backend
# frontend-out.log      - stdout frontend
# frontend-error.log    - stderr frontend
# frontend-combined.log - объединенные логи frontend

# Просмотр
cat logs/backend-error.log
tail -100 logs/backend-out.log
less logs/frontend-combined.log

# Поиск по логам
grep "telegram" logs/backend-combined.log
grep -i "error" logs/*.log

# Размер логов
du -sh logs/*
```

---

## 💾 Управление конфигурацией

```bash
# Сохранить текущий список процессов
pm2 save

# Восстановить сохраненные процессы
pm2 resurrect

# Настроить автозапуск при старте системы
pm2 startup
# Выполните команду, которую PM2 предложит

# Отключить автозапуск
pm2 unstartup systemd

# Обновить автозапуск после изменений
pm2 save
```

---

## 🔄 Обновление приложения

### Быстрый перезапуск (без изменений кода)

```bash
pm2 restart all
```

### После изменения кода

```bash
cd /opt/asian-goods-store

# Обновить зависимости (если изменились)
npm install
cd backend && npm install && cd ..

# Пересобрать frontend
npm run build

# Перезапустить
pm2 restart all

# Проверить
pm2 status
pm2 logs --lines 20
```

### Через Git

```bash
cd /opt/asian-goods-store

# Загрузить изменения
git pull origin main

# Установить зависимости
npm install
cd backend && npm install && cd ..

# Собрать
npm run build

# Перезапустить
pm2 restart all
```

---

## 🐛 Отладка проблем

### Backend не запускается

```bash
# Проверить логи ошибок
pm2 logs asian-goods-backend --err --lines 50

# Проверить .env
cat backend/.env

# Проверить порт
netstat -tlnp | grep 3001
ss -tlnp | grep 3001

# Если порт занят
lsof -i :3001
kill -9 <PID>

# Попробовать запустить напрямую
cd /opt/asian-goods-store
node backend/server.js
# Если увидите ошибку - исправьте её

# Перезапустить PM2
pm2 restart asian-goods-backend
```

### Frontend не запускается

```bash
# Проверить логи
pm2 logs asian-goods-frontend --err --lines 50

# Проверить сборку
cd /opt/asian-goods-store
npm run build

# Проверить порт
netstat -tlnp | grep 3000

# Попробовать запустить напрямую
npm start

# Перезапустить PM2
pm2 restart asian-goods-frontend
```

### Telegram уведомления не работают

```bash
# Проверить логи backend с фильтром
pm2 logs asian-goods-backend | grep -i telegram

# Проверить настройки в БД
cd /opt/asian-goods-store/backend
sqlite3 database/store.db "SELECT * FROM telegram_settings;"

# Включить уведомления в БД
sqlite3 database/store.db "UPDATE telegram_settings SET isEnabled = 1;"

# Перезапустить backend
pm2 restart asian-goods-backend
```

### Высокое потребление памяти

```bash
# Проверить использование
pm2 status

# Детальная информация
pm2 show asian-goods-backend

# Если нужно перезапустить при превышении лимита
# Отредактируйте ecosystem.config.js:
# max_memory_restart: '500M'  // для backend
# max_memory_restart: '1G'    // для frontend

# Перезапустить с новой конфигурацией
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Мониторинг системы

```bash
# PM2 мониторинг
pm2 monit

# Использование ресурсов
top
htop

# Использование диска
df -h

# Память
free -h

# Процессы Node.js
ps aux | grep node

# Открытые порты
netstat -tlnp | grep -E '3000|3001'
ss -tlnp | grep -E '3000|3001'

# Подключения к порту
netstat -an | grep :3001
```

---

## 💾 Резервное копирование

```bash
# Создать backup базы данных
cd /opt/asian-goods-store/backend/database
cp store.db backup_$(date +%Y%m%d_%H%M%S).db

# Backup через sqlite3
sqlite3 store.db ".backup 'backup_$(date +%Y%m%d_%H%M%S).db'"

# Автоматический backup (добавить в cron)
# crontab -e
# 0 2 * * * cd /opt/asian-goods-store/backend/database && cp store.db backup_$(date +\%Y\%m\%d).db

# Скачать backup на локальный компьютер
# С вашего компьютера:
scp root@45.141.78.168:/opt/asian-goods-store/backend/database/backup_*.db ./backups/

# Восстановить из backup
cd /opt/asian-goods-store/backend/database
cp backup_20251103_120000.db store.db
cd /opt/asian-goods-store
pm2 restart asian-goods-backend
```

---

## 🧹 Очистка

```bash
# Очистить логи PM2
pm2 flush

# Удалить старые логи (старше 7 дней)
find logs/ -name "*.log" -mtime +7 -delete

# Очистить node_modules и переустановить
rm -rf node_modules backend/node_modules
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all

# Очистить .next кэш
rm -rf .next
npm run build
pm2 restart asian-goods-frontend
```

---

## 🔧 Полезные однострочники

```bash
# Быстрый статус + логи
pm2 status && pm2 logs --lines 10 --nostream

# Перезапуск с проверкой
pm2 restart all && sleep 5 && pm2 status

# Проверка API
curl http://localhost:3001/api/health | jq .

# Мониторинг в реальном времени
watch -n 2 'pm2 status'

# Быстрая проверка всего
pm2 status && \
curl -s http://localhost:3001/api/health && \
echo "✅ Backend OK" || echo "❌ Backend ERROR"

# Найти процессы на портах
lsof -i :3000 -i :3001

# Использование ресурсов процессами PM2
ps aux | grep PM2 | grep -v grep
```

---

## 🆘 Экстренные команды

```bash
# Полная перезагрузка
pm2 restart all

# Если PM2 завис
pm2 kill
pm2 start ecosystem.config.js

# Если ничего не помогает
pm2 kill
rm -rf ~/.pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Восстановить последнее рабочее состояние
cd /opt/asian-goods-store
git reset --hard HEAD
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all

# Паника-кнопка (полная переустановка)
pm2 delete all
rm -rf node_modules backend/node_modules .next
npm install
cd backend && npm install && cd ..
npm run build
pm2 start ecosystem.config.js
pm2 save
```

---

## 🔍 Проверка работоспособности

```bash
# Полная проверка
echo "=== PM2 Status ==="
pm2 status

echo -e "\n=== Backend API ==="
curl -s http://localhost:3001/api/health | jq .

echo -e "\n=== Frontend ==="
curl -I http://localhost:3000 | head -1

echo -e "\n=== Ports ==="
netstat -tlnp | grep -E '3000|3001'

echo -e "\n=== Disk Usage ==="
df -h | grep -E 'Filesystem|/$'

echo -e "\n=== Memory ==="
free -h
```

Сохраните этот скрипт как `check.sh` и используйте:
```bash
chmod +x check.sh
./check.sh
```

---

## 📝 Регулярные задачи

### Ежедневно
- Проверить `pm2 status`
- Просмотреть `pm2 logs --lines 50`
- Проверить размер логов: `du -sh logs/`

### Еженедельно
- Очистить старые логи: `pm2 flush`
- Проверить обновления: `git pull`
- Создать backup БД

### Ежемесячно
- Обновить зависимости: `npm update`
- Проверить использование диска: `df -h`
- Проверить автозапуск: `pm2 startup`

---

## 💡 Советы

1. **Всегда проверяйте логи после изменений**
   ```bash
   pm2 logs --lines 20
   ```

2. **Используйте `pm2 save` после изменения процессов**
   ```bash
   pm2 restart all && pm2 save
   ```

3. **Мониторьте ресурсы**
   ```bash
   pm2 monit
   ```

4. **Делайте backup перед обновлениями**
   ```bash
   cd backend/database && cp store.db backup_$(date +%Y%m%d).db
   ```

5. **Храните логи ограниченное время**
   ```bash
   # Добавьте в cron для автоочистки
   0 0 * * 0 find /opt/asian-goods-store/logs -name "*.log" -mtime +7 -delete
   ```

---

**Быстрый доступ к этим командам всегда под рукой! 📌**

