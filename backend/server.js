const path = require('path');
// Загружаем переменные окружения из корневого .env (../.env)
try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch (_) {}
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const pathModule = require('path');

// Импорт базы данных
const db = require('./database/database');

// Импорт маршрутов
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const cartRoutes = require('./routes/cart');
const authRoutes = require('./routes/auth');
const telegramRoutes = require('./routes/telegram');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware безопасности
app.use(helmet());

// CORS настройки
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting (отключено для разработки)
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 минут
//   max: 1000, // максимум 1000 запросов с одного IP (увеличено для разработки)
//   message: 'Слишком много запросов с этого IP, попробуйте позже'
// });
// app.use(limiter);

// Логирование
app.use(morgan('combined'));

// Парсинг JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use('/uploads', express.static(pathModule.join(__dirname, 'uploads')));

// Тестовый маршрут
app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает!' });
});

// Тестовый маршрут auth
app.get('/api/auth/test', (req, res) => {
  res.json({ message: 'Auth API работает!' });
});

// Тестовый маршрут login
app.post('/api/auth/login-test', (req, res) => {
  res.json({ message: 'Login API работает!', body: req.body });
});

// Тестовый маршрут login (удален - используем настоящую авторизацию)

// Маршруты API
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/telegram', telegramRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Обработка 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    path: req.originalUrl 
  });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Ошибка сервера:', err);
  res.status(500).json({ 
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Что-то пошло не так'
  });
});

// Инициализация базы данных и запуск сервера
async function startServer() {
  try {
    await db.init();
    
    // Схема PostgreSQL применяется автоматически при инициализации базы данных
    
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🛍️  API документация: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Ошибка запуска сервера:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;

