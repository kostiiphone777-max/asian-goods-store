const fs = require('fs').promises;
const path = require('path');
const db = require('../database/database');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');

async function migrateData() {
  try {
    console.log('🔄 Начинаем миграцию данных в SQLite...');
    
    // Инициализируем базу данных
    await db.init();
    
    // Мигрируем категории
    console.log('📁 Мигрируем категории...');
    try {
      const categoriesData = await fs.readFile(path.join(__dirname, '../data/categories.json'), 'utf8');
      const categories = JSON.parse(categoriesData);
      
      for (const categoryData of categories) {
        const category = new Category(categoryData);
        await category.save();
      }
      console.log(`✅ Мигрировано ${categories.length} категорий`);
    } catch (error) {
      console.log('⚠️  Категории не найдены или уже мигрированы');
    }
    
    // Мигрируем товары
    console.log('🛍️  Мигрируем товары...');
    try {
      const productsData = await fs.readFile(path.join(__dirname, '../data/products.json'), 'utf8');
      const products = JSON.parse(productsData);
      
      for (const productData of products) {
        const product = new Product(productData);
        await product.save();
      }
      console.log(`✅ Мигрировано ${products.length} товаров`);
    } catch (error) {
      console.log('⚠️  Товары не найдены или уже мигрированы');
    }
    
    // Мигрируем пользователей (если есть)
    console.log('👥 Мигрируем пользователей...');
    try {
      const usersData = await fs.readFile(path.join(__dirname, '../data/users.json'), 'utf8');
      const users = JSON.parse(usersData);
      
      for (const userData of users) {
        const user = new User(userData);
        await user.save();
      }
      console.log(`✅ Мигрировано ${users.length} пользователей`);
    } catch (error) {
      console.log('⚠️  Ошибка миграции пользователей:', error.message);
    }
    
    console.log('🎉 Миграция завершена успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    throw error;
  }
}

// Запускаем миграцию, если скрипт вызван напрямую
if (require.main === module) {
  migrateData()
    .then(() => {
      console.log('✅ Миграция завершена');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Ошибка миграции:', error);
      process.exit(1);
    });
}

module.exports = migrateData;

