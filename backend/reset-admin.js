const Database = require('./database/database');
const User = require('./models/User');

async function resetAdminPassword() {
  try {
    await Database.init();
    
    // Найдем админа
    const admin = await User.findByEmail('admin@asiangoods.ru');
    if (!admin) {
      console.log('❌ Администратор не найден');
      return;
    }
    
    console.log('✅ Найден администратор:', admin.email);
    console.log('🔑 Текущий хеш пароля:', admin.password);
    
    // Создадим нового админа с известным паролем
    const newAdmin = await User.create({
      email: 'admin@test.com',
      password: 'admin123',
      firstName: 'Тест',
      lastName: 'Админ',
      role: 'admin'
    });
    
    console.log('✅ Новый тестовый администратор создан:');
    console.log('📧 Email: admin@test.com');
    console.log('🔑 Пароль: admin123');
    console.log('🔑 Хеш пароля:', newAdmin.password);
    
  } catch (error) {
    console.error('❌ Ошибка:', error);
  } finally {
    await Database.close();
  }
}

resetAdminPassword();

