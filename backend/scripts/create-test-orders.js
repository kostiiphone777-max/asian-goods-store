const Database = require('../database/database');
const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');

async function createTestOrders() {
  try {
    await Database.init();
    
    // Получаем пользователей и товары
    const users = await User.getAll();
    const products = await Product.getAll();
    
    if (users.length === 0) {
      console.log('❌ Нет пользователей для создания заказов');
      return;
    }
    
    if (products.length === 0) {
      console.log('❌ Нет товаров для создания заказов');
      return;
    }
    
    // Проверяем, есть ли уже заказы
    const existingOrders = await Order.getAll();
    if (existingOrders.length > 0) {
      console.log('✅ Заказы уже существуют, пропускаем создание');
      return;
    }
    
    // Создаем тестовые заказы
    const testOrders = [
      {
        userId: users[0].id,
        items: [
          {
            productId: products[0].id,
            name: products[0].name,
            price: products[0].price,
            quantity: 2,
            image: products[0].images[0]
          }
        ],
        shippingAddress: {
          firstName: 'Иван',
          lastName: 'Петров',
          street: 'ул. Ленина, 10',
          city: 'Москва',
          postalCode: '101000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Иван',
          lastName: 'Петров',
          street: 'ул. Ленина, 10',
          city: 'Москва',
          postalCode: '101000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'pending',
        notes: 'Тестовый заказ 1'
      },
      {
        userId: users[0].id,
        items: [
          {
            productId: products[1].id,
            name: products[1].name,
            price: products[1].price,
            quantity: 1,
            image: products[1].images[0]
          },
          {
            productId: products[2].id,
            name: products[2].name,
            price: products[2].price,
            quantity: 3,
            image: products[2].images[0]
          }
        ],
        shippingAddress: {
          firstName: 'Мария',
          lastName: 'Сидорова',
          street: 'пр. Мира, 25',
          city: 'Санкт-Петербург',
          postalCode: '190000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Мария',
          lastName: 'Сидорова',
          street: 'пр. Мира, 25',
          city: 'Санкт-Петербург',
          postalCode: '190000',
          country: 'Россия'
        },
        paymentMethod: 'cash',
        status: 'processing',
        notes: 'Тестовый заказ 2'
      },
      {
        userId: users[0].id,
        items: [
          {
            productId: products[3].id,
            name: products[3].name,
            price: products[3].price,
            quantity: 1,
            image: products[3].images[0]
          }
        ],
        shippingAddress: {
          firstName: 'Алексей',
          lastName: 'Козлов',
          street: 'ул. Пушкина, 5',
          city: 'Казань',
          postalCode: '420000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Алексей',
          lastName: 'Козлов',
          street: 'ул. Пушкина, 5',
          city: 'Казань',
          postalCode: '420000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'shipped',
        trackingNumber: 'TRK123456789',
        shippedAt: new Date().toISOString(),
        notes: 'Тестовый заказ 3'
      },
      {
        userId: users[0].id,
        items: [
          {
            productId: products[4].id,
            name: products[4].name,
            price: products[4].price,
            quantity: 2,
            image: products[4].images[0]
          }
        ],
        shippingAddress: {
          firstName: 'Елена',
          lastName: 'Васильева',
          street: 'ул. Гагарина, 15',
          city: 'Новосибирск',
          postalCode: '630000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Елена',
          lastName: 'Васильева',
          street: 'ул. Гагарина, 15',
          city: 'Новосибирск',
          postalCode: '630000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'delivered',
        trackingNumber: 'TRK987654321',
        shippedAt: new Date(Date.now() - 86400000).toISOString(), // 1 день назад
        deliveredAt: new Date().toISOString(),
        notes: 'Тестовый заказ 4'
      },
      {
        userId: users[0].id,
        items: [
          {
            productId: products[5].id,
            name: products[5].name,
            price: products[5].price,
            quantity: 1,
            image: products[5].images[0]
          }
        ],
        shippingAddress: {
          firstName: 'Дмитрий',
          lastName: 'Морозов',
          street: 'ул. Советская, 30',
          city: 'Екатеринбург',
          postalCode: '620000',
          country: 'Россия'
        },
        billingAddress: {
          firstName: 'Дмитрий',
          lastName: 'Морозов',
          street: 'ул. Советская, 30',
          city: 'Екатеринбург',
          postalCode: '620000',
          country: 'Россия'
        },
        paymentMethod: 'card',
        status: 'cancelled',
        notes: 'Отменен по просьбе клиента'
      }
    ];
    
    console.log('🛍️ Создаем тестовые заказы...');
    
    for (const orderData of testOrders) {
      const order = new Order(orderData);
      order.calculateTotals();
      await order.save();
      console.log(`✅ Создан заказ ${order.orderNumber} (${order.status})`);
    }
    
    console.log('🎉 Тестовые заказы созданы успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка создания тестовых заказов:', error);
  } finally {
    await Database.close();
  }
}

// Запускаем скрипт
createTestOrders();
