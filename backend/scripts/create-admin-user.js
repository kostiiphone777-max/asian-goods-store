const Database = require('../database/database');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/jwt');

async function createAdminUser() {
  try {
    await Database.init();
    
    // Проверяем, есть ли уже админ
    const existingAdmin = await User.findByEmail('admin@example.com');
    if (existingAdmin) {
      console.log('✅ Администратор уже существует');
      
      // Генерируем токен для существующего админа
      const token = jwt.sign(
        { id: existingAdmin.id, email: existingAdmin.email, role: existingAdmin.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      console.log('🔑 Токен администратора:', token);
      return;
    }
    
    // Создаем нового админа
    const adminData = {
      email: 'admin@example.com',
      password: 'admin123',
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'admin'
    };
    
    const admin = await User.create(adminData);
    
    console.log('✅ Администратор создан успешно!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Пароль: admin123');
    
    // Генерируем токен
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('🔑 Токен администратора:', token);
    
  } catch (error) {
    console.error('❌ Ошибка создания администратора:', error);
  } finally {
    await Database.close();
  }
}

// Запускаем скрипт
createAdminUser();
