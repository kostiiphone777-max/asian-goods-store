# 🔧 Исправление проблем с PostgreSQL на сервере

## 🚨 Проблема

Backend падает с ошибкой (status: `errored`), пользователь не может войти в личный кабинет. Похоже, что база данных не перенеслась или не настроена.

---

## 🔍 Диагностика

### Автоматическая диагностика

```powershell
.\fix-postgres-deploy.ps1
```

Скрипт проверит:
- Логи backend
- Настройки PostgreSQL в `.env`
- Подключение к PostgreSQL
- Наличие таблиц и данных
- Наличие старой SQLite базы

### Ручная диагностика

#### 1. Проверка логов backend

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
pm2 logs asian-goods-backend --err --lines 50
```

#### 2. Проверка .env файла

```bash
cat backend/.env | grep -E 'PGHOST|PGPORT|PGDATABASE|PGUSER|PGPASSWORD'
```

#### 3. Проверка подключения к PostgreSQL

```bash
source backend/.env
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT version();"
```

#### 4. Проверка таблиц

```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "\dt"
```

#### 5. Проверка данных

```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM users;"
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM products;"
```

---

## 🔧 Решение проблем

### Проблема 1: Таблицы не созданы

**Симптомы:** Ошибка "relation does not exist" или "table does not exist"

**Решение:**

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
source backend/.env

# Применить схему
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f backend/database/schema.postgres.sql
```

### Проблема 2: База данных пустая (нет данных)

**Симптомы:** Таблицы есть, но они пустые (COUNT = 0)

**Решение:**

#### Вариант A: Если есть старая SQLite база

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store

# Проверьте наличие SQLite базы
ls -lh backend/database/store.db

# Если есть, выполните миграцию
cd backend
node scripts/migrate-sqlite-to-postgres.js
```

#### Вариант B: Если SQLite базы нет

Нужно либо:
1. Восстановить из backup
2. Создать данные заново через админ-панель
3. Импортировать данные из другого источника

### Проблема 3: Неправильные настройки подключения

**Симптомы:** Ошибка подключения к PostgreSQL

**Решение:**

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
nano backend/.env
```

**Проверьте и исправьте:**

```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=ваш_пароль
```

**Проверьте подключение:**

```bash
source backend/.env
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1;"
```

### Проблема 4: PostgreSQL не запущен

**Симптомы:** Ошибка "connection refused" или "could not connect"

**Решение:**

```bash
# Проверьте статус PostgreSQL
systemctl status postgresql

# Запустите если не запущен
systemctl start postgresql
systemctl enable postgresql
```

### Проблема 5: База данных не существует

**Симптомы:** Ошибка "database does not exist"

**Решение:**

```bash
ssh root@45.141.78.168
source backend/.env

# Создайте базу данных
psql -h $PGHOST -U $PGUSER -d postgres -c "CREATE DATABASE $PGDATABASE;"

# Примените схему
cd /opt/asian-goods-store
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f backend/database/schema.postgres.sql
```

---

## 📋 Пошаговая инструкция исправления

### Шаг 1: Подключитесь к серверу

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
```

### Шаг 2: Проверьте логи

```bash
pm2 logs asian-goods-backend --err --lines 50
```

Запишите ошибку, чтобы понять проблему.

### Шаг 3: Проверьте настройки PostgreSQL

```bash
cat backend/.env | grep PG
```

### Шаг 4: Проверьте подключение

```bash
source backend/.env
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1;"
```

### Шаг 5: Примените схему (если таблиц нет)

```bash
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -f backend/database/schema.postgres.sql
```

### Шаг 6: Выполните миграцию (если есть SQLite база)

```bash
cd backend
node scripts/migrate-sqlite-to-postgres.js
```

### Шаг 7: Перезапустите backend

```bash
pm2 restart asian-goods-backend
pm2 status
```

### Шаг 8: Проверьте работу

```bash
# Проверка API
curl http://localhost:3001/api/health

# Проверка данных
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT COUNT(*) FROM users;"
```

---

## ✅ Проверка после исправления

1. **Статус PM2:**
   ```bash
   pm2 status
   ```
   Backend должен быть `online` (зеленый)

2. **Логи:**
   ```bash
   pm2 logs asian-goods-backend --lines 20
   ```
   Не должно быть ошибок подключения к БД

3. **API:**
   ```bash
   curl http://45.141.78.168:3001/api/health
   ```
   Должен вернуть `{"status":"OK"}`

4. **Вход в личный кабинет:**
   - Откройте http://45.141.78.168:3000
   - Попробуйте войти
   - Проверьте, что данные пользователей есть в БД

---

## 🆘 Если ничего не помогло

1. **Проверьте полные логи:**
   ```bash
   pm2 logs asian-goods-backend --lines 200
   ```

2. **Попробуйте запустить backend напрямую:**
   ```bash
   cd /opt/asian-goods-store
   node backend/server.js
   ```
   Это покажет ошибку в реальном времени

3. **Проверьте права доступа:**
   ```bash
   ls -la backend/database/
   ls -la backend/.env
   ```

4. **Проверьте версию Node.js:**
   ```bash
   node --version
   ```

---

## 📚 Дополнительные ресурсы

- [PM2_COMMANDS.md](PM2_COMMANDS.md) - команды PM2
- [DEPLOY_POSTGRES_PM2.md](DEPLOY_POSTGRES_PM2.md) - документация по деплою
- [fix-postgres-deploy.ps1](fix-postgres-deploy.ps1) - скрипт автоматической диагностики

