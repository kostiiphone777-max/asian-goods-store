-- Схема БД для PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  image TEXT,
  parentId TEXT,
  isActive BOOLEAN DEFAULT TRUE,
  sortOrder INTEGER DEFAULT 0,
  metaTitle TEXT,
  metaDescription TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DOUBLE PRECISION NOT NULL,
  originalPrice DOUBLE PRECISION,
  categoryId TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  images TEXT,
  badge TEXT,
  stock INTEGER DEFAULT 0,
  isActive BOOLEAN DEFAULT TRUE,
  tags TEXT,
  rating DOUBLE PRECISION DEFAULT 0,
  reviewCount INTEGER DEFAULT 0,
  weight TEXT,
  dimensions TEXT,
  country TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  orderNumber TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  items TEXT,
  subtotal DOUBLE PRECISION DEFAULT 0,
  shippingCost DOUBLE PRECISION DEFAULT 0,
  tax DOUBLE PRECISION DEFAULT 0,
  total DOUBLE PRECISION NOT NULL,
  shippingAddress TEXT,
  billingAddress TEXT,
  paymentMethod TEXT,
  paymentStatus TEXT DEFAULT 'pending',
  notes TEXT,
  trackingNumber TEXT,
  shippedAt TIMESTAMPTZ,
  deliveredAt TIMESTAMPTZ,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  orderId TEXT NOT NULL,
  productId TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  createdAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
  id TEXT PRIMARY KEY,
  userId TEXT,
  sessionId TEXT,
  items TEXT,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(userId, sessionId)
);

CREATE TABLE IF NOT EXISTS telegram_settings (
  id SERIAL PRIMARY KEY,
  botToken TEXT,
  chatId TEXT,
  isEnabled BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(userId);
CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(userId);



