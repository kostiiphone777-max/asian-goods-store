const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

async function createAdmin() {
  try {
    console.log('🔧 Создание администратора...');
    
    // Инициализируем базу данных
    await db.init();
    
    const adminEmail = 'admin@example.com';
    const adminPassword = 'admin123';
    
    // Проверяем, существует ли уже администратор
    const existingAdmin = await db.get('SELECT id FROM users WHERE email = ?', [adminEmail]);
    
    if (existingAdmin) {
      console.log('✅ Администратор уже существует');
      return;
    }
    
    // Создаем хеш пароля
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    const adminId = uuidv4();
    const now = new Date().toISOString();
    
    // Создаем администратора
    await db.run(
      `INSERT INTO users (id, email, passwordHash, firstName, lastName, role, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [adminId, adminEmail, passwordHash, 'Администратор', 'Системы', 'admin', now, now]
    );
    
    console.log('✅ Администратор создан успешно!');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Пароль: ${adminPassword}`);
    console.log('⚠️  Не забудьте изменить пароль после первого входа!');
    
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
    throw error;
  }
}

// Запускаем создание администратора, если скрипт вызван напрямую
if (require.main === module) {
  createAdmin()
    .then(() => {
      console.log('✅ Скрипт завершен');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка:', error);
      process.exit(1);
    });
}

module.exports = createAdmin;

