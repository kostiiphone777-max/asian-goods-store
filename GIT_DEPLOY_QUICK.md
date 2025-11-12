# 🔥 Быстрое развертывание из Git

## ⚡ За 5 шагов до работающего сайта

---

### 1️⃣ Подключитесь к серверу

```bash
ssh root@45.141.78.168
```

---

### 2️⃣ Клонируйте проект

```bash
cd /opt
git clone ВАШ_РЕПОЗИТОРИЙ asian-goods-store
cd asian-goods-store
```

**⚠️ Замените `ВАШ_РЕПОЗИТОРИЙ`!**

Например:
```bash
git clone https://github.com/username/asian-goods-store.git asian-goods-store
```

---

### 3️⃣ Настройте окружение

**Сгенерируйте JWT_SECRET:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Скопируйте результат!**

**Создайте файлы конфигурации:**

```bash
# Backend .env
cat > backend/.env << 'EOF'
PORT=3001
FRONTEND_URL=http://45.141.78.168
NODE_ENV=production
JWT_SECRET=ВСТАВЬТЕ_СЮДА_СГЕНЕРИРОВАННЫЙ_СЕКРЕТ

# PostgreSQL настройки
DB_CLIENT=postgres
PGHOST=localhost
PGPORT=5432
PGDATABASE=magazin
PGUSER=postgres
PGPASSWORD=postgres
EOF

# Frontend .env.local
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://45.141.78.168:3001/api
EOF
```

---

### 4️⃣ Установите и соберите

```bash
# Зависимости
npm install
cd backend && npm install && cd ..

# Сборка
npm run build
```

**⏳ Подождите 3-5 минут**

---

### 5️⃣ Запустите

```bash
# Запуск
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save

# Автозапуск
pm2 startup
# Выполните команду, которую предложит PM2
pm2 save
```

---

## ✅ Готово!

**Откройте в браузере:**

- 🌐 Сайт: http://45.141.78.168:3000
- 🔧 Админка: http://45.141.78.168:3000/admin
- 📋 API: http://45.141.78.168:3001/api/health

---

## 🌐 Настройте Nginx (чтобы работало без :3000)

```bash
apt install nginx -y

cat > /etc/nginx/sites-available/asian-goods << 'EOF'
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
EOF

ln -s /etc/nginx/sites-available/asian-goods /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

**Теперь откройте:** http://45.141.78.168 (без порта!)

---

## 🤖 Настройте Telegram

См. **[QUICK_TELEGRAM_SETUP.md](QUICK_TELEGRAM_SETUP.md)**

---

## 🔄 Обновление в будущем

```bash
ssh root@45.141.78.168
cd /opt/asian-goods-store
git pull
npm install
cd backend && npm install && cd ..
npm run build
pm2 restart all
```

---

## 📚 Подробная инструкция

См. **[DEPLOY_FROM_GIT.md](DEPLOY_FROM_GIT.md)**

---

**Удачи! 🚀**





