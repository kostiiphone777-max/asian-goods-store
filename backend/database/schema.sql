-- Схема базы данных для Asian Goods Store
-- SQLite

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Таблица категорий
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    image TEXT,
    parentId TEXT,
    isActive BOOLEAN DEFAULT 1,
    sortOrder INTEGER DEFAULT 0,
    metaTitle TEXT,
    metaDescription TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (parentId) REFERENCES categories(id)
);

-- Таблица товаров
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    originalPrice REAL,
    categoryId TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    images TEXT, -- JSON массив изображений
    badge TEXT,
    stock INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT 1,
    tags TEXT, -- JSON массив тегов
    rating REAL DEFAULT 0,
    reviewCount INTEGER DEFAULT 0,
    weight TEXT,
    dimensions TEXT,
    country TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryId) REFERENCES categories(id)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    orderNumber TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    items TEXT, -- JSON массив товаров
    subtotal REAL DEFAULT 0,
    shippingCost REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total REAL NOT NULL,
    shippingAddress TEXT, -- JSON объект адреса
    billingAddress TEXT, -- JSON объект адреса
    paymentMethod TEXT,
    paymentStatus TEXT DEFAULT 'pending',
    notes TEXT,
    trackingNumber TEXT,
    shippedAt DATETIME,
    deliveredAt DATETIME,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Таблица элементов заказа
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    orderId TEXT NOT NULL,
    productId TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (orderId) REFERENCES orders(id),
    FOREIGN KEY (productId) REFERENCES products(id)
);

-- Таблица корзины
CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    userId TEXT,
    sessionId TEXT,
    items TEXT, -- JSON массив товаров
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, sessionId)
);

-- Таблица настроек Telegram бота
CREATE TABLE IF NOT EXISTS telegram_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    botToken TEXT,
    chatId TEXT,
    isEnabled BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(userId);
