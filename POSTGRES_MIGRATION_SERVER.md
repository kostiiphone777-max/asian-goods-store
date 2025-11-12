# 🐘 Перенос PostgreSQL на сервер 45.141.78.168

## 📋 Пошаговая инструкция - Copy & Paste

**Проект уже работает на сервере с PM2. Добавляем PostgreSQL.**

---

## ШАГ 1: Подключитесь к серверу

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
```

---

## ШАГ 2: Установите PostgreSQL (если не установлен)

```bash
# Обновляем пакеты
apt update

# Устанавливаем PostgreSQL
apt install postgresql postgresql-contrib -y

# Запускаем и включаем автозапуск
systemctl start postgresql
systemctl enable postgresql

# Проверяем статус
systemctl status postgresql
```

**Нажмите `Ctrl+C` чтобы выйти из статуса**

---

## ШАГ 3: Создайте базу данных и пользователя

```bash
# Переключаемся на пользователя postgres
su - postgres

# Запускаем psql
psql
```

**Внутри psql выполните:**

```sql
-- Создаем базу данных
CREATE DATABASE magazin;

-- Создаем пользователя (если нужно)
CREATE USER postgres WITH PASSWORD 'postgres';

-- Даем права
GRANT ALL PRIVILEGES ON DATABASE magazin TO postgres;

-- Выходим
\q
```

**Выходим из пользователя postgres:**

```bash
exit
```

---

## ШАГ 4: Проверьте подключение к базе

```bash
# Проверяем подключение
psql -h localhost -U postgres -d magazin -c "SELECT version();"
```

**Если запросит пароль, введите:** `postgres`

---

## ШАГ 5: Обновите проект из Git (если нужно)

```bash
cd /opt/asian-goods-store

# Сохраняем текущий .env (если есть)
cp backend/.env backend/.env.backup

# Обновляем код
git pull origin main

# Восстанавливаем .env (если нужно)
# cp backend/.env.backup backend/.env
```

---

## ШАГ 6: Настройте переменные окружения

```bash
# Открываем .env файл
nano backend/.env
```

**Добавьте или обновите эти строки:**

```bash
PORT=3001
FRONTEND_URL=http://45.141.78.168
JWT_SECRET=ВАШ_СУЩЕСТВУЮЩИЙ_СЕКРЕТ
NODE_ENV=production

# PostgreSQL настройки
DB_CLIENT=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=postgres
```

**⚠️ ВАЖНО:** Не меняйте `JWT_SECRET` если он уже есть! Просто добавьте PostgreSQL настройки.

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ШАГ 7: Установите зависимости (если нужно)

```bash
cd /opt/asian-goods-store

# Устанавливаем зависимости backend
cd backend
npm install
cd ..

# Устанавливаем зависимости frontend (если нужно)
npm install
```

---

## ШАГ 8: Миграция данных (если есть старая SQLite база)

**Если у вас есть старая SQLite база с данными:**

```bash
cd /opt/asian-goods-store

# Проверяем, есть ли старая база
ls -la backend/database/store.db

# Если файл существует, запускаем миграцию
npm --prefix backend run migrate:sqlite:pg
```

**Если старой базы нет, пропустите этот шаг - таблицы создадутся автоматически.**

---

## ШАГ 9: Перезапустите PM2

```bash
# Останавливаем процессы
pm2 stop all

# Перезапускаем с обновленными переменными окружения
pm2 restart all --update-env

# Сохраняем конфигурацию
pm2 save

# Проверяем статус
pm2 status
```

---

## ШАГ 10: Проверьте логи

```bash
# Смотрим логи backend
pm2 logs asian-goods-backend --lines 50

# Должны увидеть:
# ✅ Подключение к PostgreSQL установлено
# ✅ Таблицы PostgreSQL созданы/обновлены
```

**Нажмите `Ctrl+C` чтобы выйти из логов**

---

## ШАГ 11: Проверьте работу API

```bash
# Проверяем health check
curl http://localhost:3001/api/health

# Должен вернуть JSON с status: "OK"
```

---

## ✅ Готово!

**Проверьте в браузере:**
- 🌐 Сайт: http://45.141.78.168
- 🔧 API: http://45.141.78.168:3001/api/health

---

## 🔧 Если что-то пошло не так

### Ошибка подключения к PostgreSQL

```bash
# Проверьте, запущен ли PostgreSQL
systemctl status postgresql

# Если не запущен:
systemctl start postgresql

# Проверьте подключение вручную
psql -h localhost -U postgres -d magazin
```

### Ошибка "database does not exist"

```bash
# Создайте базу заново
su - postgres
psql
CREATE DATABASE magazin;
\q
exit
```

### Ошибка "password authentication failed"

```bash
# Проверьте пароль в backend/.env
cat backend/.env | grep PGPASSWORD

# Или измените пароль PostgreSQL:
su - postgres
psql
ALTER USER postgres WITH PASSWORD 'postgres';
\q
exit
```

### PM2 не видит новые переменные

```bash
# Удалите процессы и запустите заново
pm2 delete all
cd /opt/asian-goods-store
pm2 start ecosystem.config.js
pm2 save
```

---

## 📊 Полезные команды для работы с PostgreSQL

```bash
# Подключиться к базе
psql -h localhost -U postgres -d magazin

# Посмотреть все таблицы
psql -h localhost -U postgres -d magazin -c "\dt"

# Посмотреть количество записей в таблице
psql -h localhost -U postgres -d magazin -c "SELECT COUNT(*) FROM products;"

# Создать backup
pg_dump -h localhost -U postgres -d magazin -F c -f /backup/magazin_$(date +%Y%m%d).dump

# Восстановить из backup
pg_restore -h localhost -U postgres -d magazin --clean --if-exists /backup/magazin_20251103.dump
```

---

**Удачи! 🚀**


