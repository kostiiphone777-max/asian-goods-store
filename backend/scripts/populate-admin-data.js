const Database = require('../database/database');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const Category = require('../models/Category');

async function populateAdminData() {
  try {
    await Database.init();
    
    console.log('🔄 Заполняем админ-панель данными...');
    
    // 1. Создаем дополнительные категории
    console.log('📁 Создаем категории...');
    const categories = [
      {
        name: 'Продукты питания',
        slug: 'food',
        description: 'Азиатские продукты питания: соусы, специи, лапша, рис',
        image: '/asian-food-products.jpg',
        isActive: true,
        sortOrder: 1
      },
      {
        name: 'Косметика',
        slug: 'cosmetics',
        description: 'Корейская и японская косметика',
        image: '/asian-cosmetics.jpg',
        isActive: true,
        sortOrder: 2
      },
      {
        name: 'Посуда',
        slug: 'tableware',
        description: 'Традиционная азиатская посуда',
        image: '/asian-tableware.jpg',
        isActive: true,
        sortOrder: 3
      },
      {
        name: 'Декор',
        slug: 'decor',
        description: 'Декоративные предметы и сувениры',
        image: '/asian-decor.jpg',
        isActive: true,
        sortOrder: 4
      }
    ];
    
    for (const catData of categories) {
      const existing = await Category.getBySlug(catData.slug);
      if (!existing) {
        const category = new Category(catData);
        await category.save();
        console.log(`✅ Создана категория: ${category.name}`);
      }
    }
    
    // 2. Создаем дополнительные товары
    console.log('📦 Создаем товары...');
    const products = [
      {
        name: 'Корейская маска для лица',
        description: 'Увлажняющая тканевая маска с гиалуроновой кислотой',
        price: 450,
        originalPrice: 600,
        categoryId: 'cosmetics',
        slug: 'korean-face-mask',
        images: ['/korean-face-mask.jpg'],
        badge: 'Популярное',
        stock: 25,
        isActive: true,
        tags: ['маска', 'корея', 'увлажнение'],
        rating: 4.8,
        reviewCount: 42,
        weight: '25ml',
        country: 'Корея'
      },
      {
        name: 'Японский зеленый чай',
        description: 'Премиальный зеленый чай сенча из Японии',
        price: 1200,
        categoryId: 'food',
        slug: 'japanese-green-tea',
        images: ['/japanese-green-tea.jpg'],
        badge: 'Эксклюзив',
        stock: 15,
        isActive: true,
        tags: ['чай', 'япония', 'премиум'],
        rating: 4.9,
        reviewCount: 18,
        weight: '100g',
        country: 'Япония'
      },
      {
        name: 'Китайские палочки для еды',
        description: 'Набор бамбуковых палочек в подарочной упаковке',
        price: 180,
        categoryId: 'tableware',
        slug: 'chinese-chopsticks',
        images: ['/chinese-chopsticks.jpg'],
        stock: 50,
        isActive: true,
        tags: ['палочки', 'бамбук', 'подарок'],
        rating: 4.5,
        reviewCount: 31,
        weight: '50g',
        country: 'Китай'
      },
      {
        name: 'Тайская статуэтка слона',
        description: 'Декоративная статуэтка слона из дерева',
        price: 850,
        categoryId: 'decor',
        slug: 'thai-elephant-statue',
        images: ['/thai-elephant-statue.jpg'],
        badge: 'Новинка',
        stock: 8,
        isActive: true,
        tags: ['статуэтка', 'слон', 'дерево'],
        rating: 4.6,
        reviewCount: 12,
        weight: '500g',
        country: 'Таиланд'
      }
    ];
    
    for (const prodData of products) {
      const existing = await Product.getBySlug(prodData.slug);
      if (!existing) {
        const product = new Product(prodData);
        await product.save();
        console.log(`✅ Создан товар: ${product.name}`);
      }
    }
    
    // 3. Создаем дополнительные заказы
    console.log('🛒 Создаем заказы...');
    const orders = [
      {
        userId: '84b7f3c0-8507-47c1-b184-90b5d6eb7da5', // admin user
        items: [
          {
            productId: 'korean-face-mask',
            name: 'Корейская маска для лица',
            price: 450,
            quantity: 2,
            image: '/korean-face-mask.jpg'
          }
        ],
        shippingAddress: {
          firstName: 'Анна',
          lastName: 'Петрова',
          street: 'ул. Мира, 15',
          city: 'Москва',
          postalCode: '101000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Анна',
          lastName: 'Петрова',
          street: 'ул. Мира, 15',
          city: 'Москва',
          postalCode: '101000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'pending',
        notes: 'Срочный заказ'
      },
      {
        userId: '84b7f3c0-8507-47c1-b184-90b5d6eb7da5',
        items: [
          {
            productId: 'japanese-green-tea',
            name: 'Японский зеленый чай',
            price: 1200,
            quantity: 1,
            image: '/japanese-green-tea.jpg'
          },
          {
            productId: 'chinese-chopsticks',
            name: 'Китайские палочки для еды',
            price: 180,
            quantity: 3,
            image: '/chinese-chopsticks.jpg'
          }
        ],
        shippingAddress: {
          firstName: 'Михаил',
          lastName: 'Сидоров',
          street: 'пр. Победы, 25',
          city: 'Санкт-Петербург',
          postalCode: '190000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Михаил',
          lastName: 'Сидоров',
          street: 'пр. Победы, 25',
          city: 'Санкт-Петербург',
          postalCode: '190000',
          country: 'Россия'
        },
        paymentMethod: 'cash',
        status: 'processing',
        notes: 'Подарочная упаковка'
      },
      {
        userId: '84b7f3c0-8507-47c1-b184-90b5d6eb7da5',
        items: [
          {
            productId: 'thai-elephant-statue',
            name: 'Тайская статуэтка слона',
            price: 850,
            quantity: 1,
            image: '/thai-elephant-statue.jpg'
          }
        ],
        shippingAddress: {
          firstName: 'Елена',
          lastName: 'Козлова',
          street: 'ул. Ленина, 8',
          city: 'Казань',
          postalCode: '420000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Елена',
          lastName: 'Козлова',
          street: 'ул. Ленина, 8',
          city: 'Казань',
          postalCode: '420000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'shipped',
        trackingNumber: 'TRK789123456',
        shippedAt: new Date().toISOString(),
        notes: 'Хрупкий товар'
      }
    ];
    
    for (const orderData of orders) {
      const order = new Order(orderData);
      order.calculateTotals();
      await order.save();
      console.log(`✅ Создан заказ ${order.orderNumber} (${order.status})`);
    }
    
    console.log('🎉 Данные для админ-панели заполнены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка заполнения данных:', error);
  } finally {
    await Database.close();
  }
}

// Запускаем скрипт
populateAdminData();
