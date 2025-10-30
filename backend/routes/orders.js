const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Cart = require('../models/Cart');
const db = require('../database/database');

const router = express.Router();

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  const jwt = require('jsonwebtoken');
  const { JWT_SECRET } = require('../config/jwt');

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Создать заказ
router.post('/', authenticateToken, [
  body('items').isArray({ min: 1 }).withMessage('Заказ должен содержать товары'),
  body('shippingAddress').notEmpty().withMessage('Адрес доставки обязателен'),
  body('paymentMethod').notEmpty().withMessage('Способ оплаты обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { items, shippingAddress, billingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // Проверяем наличие товаров и их количество на складе
    for (const item of items) {
      const product = await Product.getById(item.productId);
      if (!product) {
        return res.status(400).json({ error: `Товар с ID ${item.productId} не найден` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          error: `Недостаточно товара "${product.name}" на складе. Доступно: ${product.stock}` 
        });
      }
    }

    // Создаем заказ
    const order = new Order({
      userId,
      items,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      notes,
      shippingCost: 0 // Стоимость доставки будет рассчитываться при оформлении
    });

    // Рассчитываем итоговую сумму
    order.calculateTotals();

    // Сохраняем заказ
    await order.save();

    // Обновляем количество товаров на складе
    for (const item of items) {
      await Product.updateStock(item.productId, item.quantity);
    }

    // Очищаем корзину пользователя
    const cartData = await Cart.getByUserId(userId);
    if (cartData) {
      const cart = new Cart(cartData);
      cart.clear();
      await cart.save();
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заказы пользователя
router.get('/my-orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.getByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заказ по ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Проверяем, что пользователь может видеть этот заказ
    if (order.userId !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить заказ по номеру
router.get('/number/:orderNumber', authenticateToken, async (req, res) => {
  try {
    const order = await Order.getByOrderNumber(req.params.orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    // Проверяем, что пользователь может видеть этот заказ
    if (order.userId !== req.user.id) {
      const user = await User.findById(req.user.id);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен' });
      }
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить статус заказа (только для админов)
router.put('/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Некорректный статус заказа'),
  body('trackingNumber').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    const { status, trackingNumber } = req.body;
    const additionalData = trackingNumber ? { trackingNumber } : {};

    await order.updateStatus(status, additionalData);
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Отменить заказ
router.put('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const order = await Order.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ error: 'Заказ нельзя отменить' });
    }

    // Возвращаем товары на склад
    for (const item of order.items) {
      await db.run(
        'UPDATE products SET stock = stock + ?, updatedAt = ? WHERE id = ?',
        [item.quantity, new Date().toISOString(), item.productId]
      );
    }

    // Обновляем статус заказа в базе данных
    await db.run(
      'UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?',
      ['cancelled', new Date().toISOString(), order.id]
    );
    
    // Возвращаем обновленный заказ
    const updatedOrder = await Order.getById(order.id);
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить статистику заказов (только для админов)
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const stats = await Order.getStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить популярные товары на основе заказов (только для админов)
router.get('/admin/popular-products', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const popularProducts = await Order.getProductPopularity();
    res.json(popularProducts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить все заказы (только для админов)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const { 
      status, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      page = 1, 
      limit = 20 
    } = req.query;
    
    let orders = await Order.getAll();

    // Фильтрация по статусу
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Поиск по клиенту (имя пользователя)
    if (search) {
      const searchLower = search.toLowerCase();
      const filteredOrders = [];
      
      for (const order of orders) {
        try {
          const user = await User.findById(order.userId);
          if (user) {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = user.email.toLowerCase();
            if (fullName.includes(searchLower) || 
                email.includes(searchLower) ||
                order.orderNumber.toLowerCase().includes(searchLower)) {
              filteredOrders.push(order);
            }
          }
        } catch (err) {
          console.error('Error fetching user for order:', err);
        }
      }
      
      orders = filteredOrders;
    }

    // Сортировка
    const sortedOrders = [];
    
    for (const order of orders) {
      sortedOrders.push({ order, sortValue: null });
    }
    
    // Получаем значения для сортировки
    for (const item of sortedOrders) {
      const order = item.order;
      
      switch (sortBy) {
        case 'customer':
          // Сортировка по имени клиента
          try {
            const user = await User.findById(order.userId);
            item.sortValue = user ? `${user.firstName} ${user.lastName}` : '';
          } catch (err) {
            item.sortValue = '';
          }
          break;
        case 'total':
          item.sortValue = order.total;
          break;
        case 'status':
          item.sortValue = order.status;
          break;
        case 'createdAt':
        default:
          item.sortValue = new Date(order.createdAt);
          break;
      }
    }
    
    // Сортируем
    sortedOrders.sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.sortValue > b.sortValue ? 1 : -1;
      } else {
        return a.sortValue < b.sortValue ? 1 : -1;
      }
    });
    
    // Извлекаем заказы
    orders = sortedOrders.map(item => item.order);

    // Пагинация
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
      orders: paginatedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(orders.length / limit),
        totalItems: orders.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


