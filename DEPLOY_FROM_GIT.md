# 🚀 Развертывание из Git на сервер 45.141.78.168

## 📋 Пошаговая инструкция - Copy & Paste

---

## ШАГ 1: Подключитесь к серверу

```bash
ssh root@45.141.78.168
```

---

## ШАГ 2: Клонируйте проект из Git

```bash
# Перейдите в директорию (обычно /opt или /var/www)
cd /opt

# Клонируйте репозиторий
git clone ВАШ_РЕПОЗИТОРИЙ asian-goods-store

# Перейдите в директорию проекта
cd asian-goods-store
```

**⚠️ Замените `ВАШ_РЕПОЗИТОРИЙ` на URL вашего репозитория!**

Например:
```bash
git clone https://github.com/username/asian-goods-store.git asian-goods-store
```

Или если используете SSH:
```bash
git clone git@github.com:username/asian-goods-store.git asian-goods-store
```

---

## ШАГ 3: Создайте директорию для логов

```bash
mkdir -p logs
```

---

## ШАГ 4: Настройте Backend окружение

### 4.1 Создайте .env для backend

```bash
nano backend/.env
```

### 4.2 Вставьте эти настройки:

```bash
PORT=3001
FRONTEND_URL=http://45.141.78.168
NODE_ENV=production
JWT_SECRET=ВРЕМЕННЫЙ_СЕКРЕТ

# PostgreSQL настройки
DB_CLIENT=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=postgres
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 4.3 Сгенерируйте правильный JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Скопируйте результат!**

### 4.4 Откройте .env снова и замените JWT_SECRET

```bash
nano backend/.env
```

Замените `ВРЕМЕННЫЙ_СЕКРЕТ` на сгенерированную строку.

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ШАГ 5: Настройте Frontend окружение

```bash
nano .env.local
```

**Вставьте:**

```bash
NEXT_PUBLIC_API_URL=http://45.141.78.168:3001/api
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

---

## ШАГ 6: Установите зависимости

### 6.1 Frontend зависимости

```bash
npm install
```

**⏳ Подождите 2-3 минуты**

### 6.2 Backend зависимости

```bash
cd backend
npm install
cd ..
```

**⏳ Подождите 1-2 минуты**

---

## ШАГ 7: Соберите Frontend

```bash
npm run build
```

**⏳ Подождите 2-5 минут**

---

## ШАГ 8: Запустите с PM2

```bash
pm2 start ecosystem.config.js
```

---

## ШАГ 9: Сохраните конфигурацию PM2

```bash
pm2 save
```

---

## ШАГ 10: Настройте автозапуск

```bash
pm2 startup
```

**PM2 выведет команду - скопируйте и выполните её!**

Затем снова:

```bash
pm2 save
```

---

## ✅ ШАГ 11: Проверьте работу

### 11.1 Проверьте статус PM2

```bash
pm2 status
```

**Должно быть:**
```
┌─────┬──────────────────────────┬─────────┬─────────┐
│ id  │ name                     │ status  │ cpu     │
├─────┼──────────────────────────┼─────────┼─────────┤
│ 0   │ asian-goods-backend      │ online  │ 0%      │
│ 1   │ asian-goods-frontend     │ online  │ 0%      │
└─────┴──────────────────────────┴─────────┴─────────┘
```

### 11.2 Проверьте логи

```bash
pm2 logs --lines 20
```

### 11.3 Проверьте API

```bash
curl http://localhost:3001/api/health
```

**Должно вернуть:** `{"status":"OK",...}`

---

## 🌐 ШАГ 12: Откройте в браузере

На вашем компьютере откройте:

- **Сайт:** http://45.141.78.168:3000
- **API:** http://45.141.78.168:3001/api/health
- **Админка:** http://45.141.78.168:3000/admin

**✅ Если открывается - отлично!**

---

## 🌐 ШАГ 13: Настройте Nginx (чтобы работало без :3000)

### 13.1 Установите Nginx (если не установлен)

```bash
apt update
apt install nginx -y
```

### 13.2 Создайте конфигурацию

```bash
nano /etc/nginx/sites-available/asian-goods
```

### 13.3 Вставьте всю эту конфигурацию:

```nginx
server {
    listen 80;
    server_name 45.141.78.168;
    client_max_body_size 20M;

    location /api/ {
        proxy_pass http://localhost:3001/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /opt/asian-goods-store/backend/uploads/;
        expires 30d;
    }

    location /_next/ {
        proxy_pass http://localhost:3000/_next/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Сохраните:** `Ctrl+O`, `Enter`, `Ctrl+X`

### 13.4 Активируйте конфигурацию

```bash
ln -s /etc/nginx/sites-available/asian-goods /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 13.5 Проверьте

Откройте: **http://45.141.78.168** (без порта!)

**✅ Должен открыться сайт**

---

## 🤖 ШАГ 14: Настройте Telegram бота

Следуйте инструкциям в файле **QUICK_TELEGRAM_SETUP.md**

Кратко:

1. Telegram → @BotFather → `/newbot` → Скопируйте токен
2. Telegram → @userinfobot → Скопируйте Chat ID
3. http://45.141.78.168/admin → Настройки Telegram
4. Вставьте токен и Chat ID → Тест → Сохранить

---

## 🎉 ГОТОВО!

Ваш проект развернут и работает!

---

## 🔄 Обновление проекта в будущем

Когда будете обновлять код:

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store

# Загрузить изменения
git pull origin main

# Установить зависимости (если изменились)
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

---

## 🆘 Если что-то не работает

### Backend не запускается

```bash
pm2 logs asian-goods-backend --lines 50
cat backend/.env
pm2 restart asian-goods-backend
```

### Frontend не запускается

```bash
pm2 logs asian-goods-frontend --lines 50
npm run build
pm2 restart asian-goods-frontend
```

### Проверить порты

```bash
netstat -tlnp | grep -E '3000|3001'
```

### Полный перезапуск

```bash
pm2 restart all
pm2 status
```

---

## 📋 Основные команды

```bash
# Подключение
ssh root@45.141.78.168
cd /opt/asian-goods-store

# Статус
pm2 status

# Логи
pm2 logs

# Перезапуск
pm2 restart all

# Обновление из Git
git pull
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
```

---

## ✅ Чек-лист

- [ ] Подключился к серверу
- [ ] Склонировал репозиторий из Git
- [ ] Создал директорию logs
- [ ] Настроил backend/.env с JWT_SECRET
- [ ] Настроил .env.local
- [ ] Установил зависимости (npm install)
- [ ] Установил backend зависимости
- [ ] Собрал frontend (npm run build)
- [ ] Запустил PM2 (pm2 start ecosystem.config.js)
- [ ] Сохранил PM2 (pm2 save)
- [ ] Настроил автозапуск (pm2 startup)
- [ ] Проверил статус (pm2 status - оба online)
- [ ] Проверил API (curl localhost:3001/api/health)
- [ ] Открыл сайт в браузере
- [ ] Настроил Nginx (опционально)
- [ ] Настроил Telegram бота
- [ ] Протестировал уведомления

---

**Удачи! 🚀**


