const db = require('../database/database');

async function fixCartTable() {
  try {
    console.log('🔧 Инициализация базы данных...');
    await db.init();
    
    console.log('🔧 Исправление таблицы корзины...');
    
    // Удаляем старую таблицу корзины
    await db.run('DROP TABLE IF EXISTS cart_items');
    
    // Создаем новую таблицу корзины с правильной структурой
    await db.run(`
      CREATE TABLE cart_items (
        id TEXT PRIMARY KEY,
        userId TEXT,
        sessionId TEXT,
        items TEXT, -- JSON массив товаров
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        UNIQUE(userId, sessionId)
      )
    `);
    
    // Создаем индекс для оптимизации
    await db.run('CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(userId)');
    await db.run('CREATE INDEX IF NOT EXISTS idx_cart_session ON cart_items(sessionId)');
    
    console.log('✅ Таблица корзины исправлена!');
    
  } catch (error) {
    console.error('❌ Ошибка исправления таблицы корзины:', error);
    throw error;
  }
}

// Запускаем исправление, если скрипт вызван напрямую
if (require.main === module) {
  fixCartTable()
    .then(() => {
      console.log('✅ Исправление завершено');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка исправления:', error);
      process.exit(1);
    });
}

module.exports = fixCartTable;
