# 🚀 Деплой на сервер с Postgres и PM2

**Сервер:** 45.141.78.168  
**База данных:** PostgreSQL (только Postgres, SQLite удален)  
**Менеджер процессов:** PM2

---

## ⚡ Быстрый старт

### Вариант 1: Автоматический деплой (рекомендуется)

```powershell
.\deploy-to-server-pm2.ps1
```

Выберите пункт **1 (Полное развертывание)**

### Вариант 2: Ручной деплой через SCP

#### Шаг 1: Подключитесь к серверу

```bash
ssh root@45.141.78.168
```

#### Шаг 2: На сервере - удалите старые SQLite файлы

```bash
cd /opt/asian-goods-store
rm -f backend/database/store.db
rm -f backend/database/schema.sql
rm -f backend/scripts/init-database.js
rm -f backend/scripts/migrate-to-sqlite.js
```

#### Шаг 3: На вашем компьютере - скопируйте файлы

```powershell
# Создайте архив (исключая node_modules, .next, SQLite файлы)
tar -czf deploy.tar.gz `
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

# Загрузите на сервер
scp deploy.tar.gz root@45.141.78.168:/opt/asian-goods-store/

# На сервере распакуйте
ssh root@45.141.78.168 "cd /opt/asian-goods-store && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
```

#### Шаг 4: На сервере - настройте PostgreSQL

```bash
cd /opt/asian-goods-store

# Проверьте/создайте backend/.env
nano backend/.env
```

**Убедитесь, что в `backend/.env` есть настройки PostgreSQL:**

```env
PORT=3001
FRONTEND_URL=http://45.141.78.168
JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
NODE_ENV=production

# PostgreSQL настройки
DB_CLIENT=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=ваш_пароль_postgres

# Или используйте одну строку:
# POSTGRES_URL=postgres://postgres:пароль@localhost:5432/magazin
```

#### Шаг 5: На сервере - установите зависимости и соберите проект

```bash
cd /opt/asian-goods-store

# Установка зависимостей
npm install --production=false
cd backend && npm install && cd ..

# Сборка frontend
npm run build
```

#### Шаг 6: На сервере - проверьте PostgreSQL и запустите PM2

```bash
# Проверка подключения к PostgreSQL
source backend/.env
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1;"

# Если подключение успешно, запустите PM2
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 status
```

---

## ✅ Проверка работы

### Проверка API

```bash
curl http://45.141.78.168:3001/api/health
```

### Проверка PM2

```bash
ssh root@45.141.78.168 "cd /opt/asian-goods-store && pm2 status"
```

### Просмотр логов

```bash
ssh root@45.141.78.168 "cd /opt/asian-goods-store && pm2 logs --lines 50"
```

---

## 🔄 Обновление проекта

### Автоматически

```powershell
.\deploy-to-server-pm2.ps1
```

Выберите пункт **2 (Только загрузить код)**, затем **3 (Обновить и перезапустить)**

### Вручную

```powershell
# 1. Загрузите код (см. Шаг 3 выше)

# 2. На сервере обновите и перезапустите
ssh root@45.141.78.168 "cd /opt/asian-goods-store && npm install && cd backend && npm install && cd .. && npm run build && pm2 restart all"
```

---

## 💾 Backup PostgreSQL

### Автоматически

```powershell
.\deploy-to-server-pm2.ps1
```

Выберите пункт **7 (Создать backup базы данных)**

### Вручную

```bash
ssh root@45.141.78.168 "cd /opt/asian-goods-store && source backend/.env && pg_dump -h \$PGHOST -U \$PGUSER -d \$PGDATABASE > backup_\$(date +%Y%m%d_%H%M%S).sql"
```

---

## ⚠️ Важные замечания

1. **Только PostgreSQL**: Убедитесь, что все SQLite файлы удалены
2. **Переменные окружения**: Проверьте `backend/.env` на сервере
3. **Пароль PostgreSQL**: Используйте надежный пароль в production
4. **JWT_SECRET**: Используйте случайную строку минимум 32 символа
5. **Порты**: Backend на 3001, Frontend на 3000

---

## 🐛 Решение проблем

### PostgreSQL не подключается

```bash
# Проверьте, запущен ли PostgreSQL
systemctl status postgresql

# Проверьте настройки подключения
psql -h localhost -U postgres -d magazin -c "SELECT 1;"
```

### PM2 не запускается

```bash
# Проверьте логи
pm2 logs asian-goods-backend --lines 100

# Проверьте переменные окружения
pm2 env 0
```

### Приложение не отвечает

```bash
# Проверьте статус PM2
pm2 status

# Перезапустите
pm2 restart all

# Проверьте порты
netstat -tulpn | grep -E '3000|3001'
```

---

## 📚 Дополнительная документация

- [PM2_COMMANDS.md](PM2_COMMANDS.md) - все команды PM2
- [COMMANDS_CHEATSHEET.md](COMMANDS_CHEATSHEET.md) - шпаргалка команд
- [ecosystem.config.js](ecosystem.config.js) - конфигурация PM2

