const Database = require('../database/database');

async function recreateOrdersTable() {
  try {
    await Database.init();
    
    console.log('🗑️ Удаляем старую таблицу orders...');
    await Database.run('DROP TABLE IF EXISTS orders');
    
    console.log('🔄 Создаем новую таблицу orders...');
    await Database.run(`
      CREATE TABLE orders (
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
      )
    `);
    
    console.log('✅ Таблица orders пересоздана успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка пересоздания таблицы orders:', error);
  } finally {
    await Database.close();
  }
}

// Запускаем скрипт
recreateOrdersTable();
