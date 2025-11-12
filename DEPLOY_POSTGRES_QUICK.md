# ⚡ Быстрый деплой на сервер с Postgres

## 🎯 Что нужно сделать

Перенести проект на сервер **45.141.78.168** с использованием **PM2** и **PostgreSQL** (SQLite удален).

---

## 🚀 Способ 1: Автоматический (рекомендуется)

### Выполните в PowerShell:

```powershell
.\deploy-to-server-pm2.ps1
```

### Выберите пункт меню:

**1) Полное развертывание** - загрузит код, установит зависимости, соберет проект и запустит PM2

---

## 📋 Способ 2: Ручной деплой через SCP

### Шаг 1: Удалите старые SQLite файлы на сервере

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
rm -f backend/database/store.db
rm -f backend/database/schema.sql
exit
```

### Шаг 2: Создайте архив и загрузите на сервер

**В PowerShell (из директории проекта):**

```powershell
tar -czf deploy.tar.gz --exclude=node_modules --exclude=.next --exclude=backend/node_modules --exclude=backend/database/store.db --exclude=backend/database/*.db --exclude=backend/database/*.sqlite --exclude=backend/database/schema.sql --exclude=.git --exclude=logs *

scp deploy.tar.gz root@45.141.78.168:/opt/asian-goods-store/

ssh root@45.141.78.168 "cd /opt/asian-goods-store && tar -xzf deploy.tar.gz && rm deploy.tar.gz"
```

### Шаг 3: Настройте PostgreSQL на сервере

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
nano backend/.env
```

**Убедитесь, что в `backend/.env` есть:**

```env
PORT=3001
FRONTEND_URL=http://45.141.78.168
JWT_SECRET=ваш_секретный_ключ_минимум_32_символа
NODE_ENV=production

# PostgreSQL настройки
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=ваш_пароль_postgres
```

### Шаг 4: Установите зависимости и соберите проект

```bash
cd /opt/asian-goods-store
npm install --production=false
cd backend && npm install && cd ..
npm run build
```

### Шаг 5: Проверьте PostgreSQL и запустите PM2

```bash
source backend/.env
psql -h $PGHOST -U $PGUSER -d $PGDATABASE -c "SELECT 1;"

pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
pm2 status
```

---

## ✅ Проверка работы

```bash
# Проверка API
curl http://45.141.78.168:3001/api/health

# Проверка PM2
ssh root@45.141.78.168 "cd /opt/asian-goods-store && pm2 status"

# Просмотр логов
ssh root@45.141.78.168 "cd /opt/asian-goods-store && pm2 logs --lines 50"
```

---

## 🔄 Обновление проекта

### Автоматически:

```powershell
.\deploy-to-server-pm2.ps1
```

Выберите:
- **2** - Только загрузить код
- **3** - Обновить и перезапустить

### Вручную:

```bash
ssh root@45.141.78.168 "cd /opt/asian-goods-store && npm install && cd backend && npm install && cd .. && npm run build && pm2 restart all"
```

---

## ⚠️ Важно

1. ✅ **Только PostgreSQL** - все SQLite файлы должны быть удалены
2. ✅ **Проверьте `backend/.env`** - должны быть настройки PostgreSQL
3. ✅ **JWT_SECRET** - используйте случайную строку минимум 32 символа
4. ✅ **Пароль PostgreSQL** - используйте надежный пароль

---

## 📚 Дополнительная документация

- [DEPLOY_POSTGRES_PM2.md](DEPLOY_POSTGRES_PM2.md) - подробная инструкция
- [QUICK_DEPLOY_POSTGRES.txt](QUICK_DEPLOY_POSTGRES.txt) - команды для копирования
- [deploy-to-server-pm2.ps1](deploy-to-server-pm2.ps1) - скрипт автоматизации

