const Database = require('../database/database');

async function updateCategoriesSchema() {
  try {
    console.log('Инициализация базы данных...');
    await Database.init();
    
    console.log('Обновление схемы таблицы categories...');
    
    // Добавляем недостающие колонки
    await Database.run(`
      ALTER TABLE categories ADD COLUMN parentId TEXT;
    `);
    console.log('✓ Добавлена колонка parentId');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Колонка parentId уже существует');
    } else {
      console.error('Ошибка добавления parentId:', error.message);
    }
  }

  try {
    await Database.run(`
      ALTER TABLE categories ADD COLUMN isActive BOOLEAN DEFAULT 1;
    `);
    console.log('✓ Добавлена колонка isActive');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Колонка isActive уже существует');
    } else {
      console.error('Ошибка добавления isActive:', error.message);
    }
  }

  try {
    await Database.run(`
      ALTER TABLE categories ADD COLUMN sortOrder INTEGER DEFAULT 0;
    `);
    console.log('✓ Добавлена колонка sortOrder');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Колонка sortOrder уже существует');
    } else {
      console.error('Ошибка добавления sortOrder:', error.message);
    }
  }

  try {
    await Database.run(`
      ALTER TABLE categories ADD COLUMN metaTitle TEXT;
    `);
    console.log('✓ Добавлена колонка metaTitle');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Колонка metaTitle уже существует');
    } else {
      console.error('Ошибка добавления metaTitle:', error.message);
    }
  }

  try {
    await Database.run(`
      ALTER TABLE categories ADD COLUMN metaDescription TEXT;
    `);
    console.log('✓ Добавлена колонка metaDescription');
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Колонка metaDescription уже существует');
    } else {
      console.error('Ошибка добавления metaDescription:', error.message);
    }
  }

  // Обновляем существующие записи
  try {
    await Database.run(`
      UPDATE categories SET isActive = 1 WHERE isActive IS NULL;
    `);
    console.log('✓ Обновлены значения isActive для существующих записей');
  } catch (error) {
    console.error('Ошибка обновления isActive:', error.message);
  }

  try {
    await Database.run(`
      UPDATE categories SET sortOrder = 0 WHERE sortOrder IS NULL;
    `);
    console.log('✓ Обновлены значения sortOrder для существующих записей');
  } catch (error) {
    console.error('Ошибка обновления sortOrder:', error.message);
  }

  console.log('✅ Схема таблицы categories успешно обновлена!');
  await Database.close();
  process.exit(0);
}

updateCategoriesSchema().catch(error => {
  console.error('Ошибка обновления схемы:', error);
  process.exit(1);
});
