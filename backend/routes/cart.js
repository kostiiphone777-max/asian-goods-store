const express = require('express');
const { body, validationResult } = require('express-validator');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

const router = express.Router();

// Middleware для проверки JWT токена (опционально)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwt = require('jsonwebtoken');
    const { JWT_SECRET } = require('../config/jwt');

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
};

// Получить корзину
router.get('/', optionalAuth, async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      // Пользователь авторизован
      cart = await Cart.getByUserId(req.user.id);
    } else {
      // Гость - используем sessionId
      const sessionId = req.headers['x-session-id'];
      if (sessionId) {
        cart = await Cart.getBySessionId(sessionId);
      }
    }

    if (!cart) {
      return res.json({ items: [], totalItems: 0, totalPrice: 0 });
    }

    // Получаем актуальную информацию о товарах
    const itemsWithDetails = await Promise.all(
      cart.items.map(async (item) => {
        const product = await Product.getById(item.productId);
        return {
          ...item,
          product: product ? {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.images[0] || '/placeholder.svg',
            stock: product.stock,
            isActive: product.isActive
          } : null
        };
      })
    );

    // Фильтруем неактивные товары
    const activeItems = itemsWithDetails.filter(item => 
      item.product && item.product.isActive && item.product.stock > 0
    );

    res.json({
      items: activeItems,
      totalItems: activeItems.reduce((total, item) => total + item.quantity, 0),
      totalPrice: activeItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить товар в корзину
router.post('/add', optionalAuth, [
  body('productId').notEmpty().withMessage('ID товара обязателен'),
  body('quantity').isInt({ min: 1 }).withMessage('Количество должно быть положительным числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    
    // Проверяем существование товара
    const product = await Product.getById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    if (product.stock < quantity) {
      return res.status(400).json({ 
        error: `Недостаточно товара на складе. Доступно: ${product.stock}` 
      });
    }

    let cart;
    
    if (req.user) {
      // Пользователь авторизован
      const cartData = await Cart.getByUserId(req.user.id);
      if (!cartData) {
        cart = new Cart({ userId: req.user.id });
      } else {
        cart = new Cart(cartData);
      }
    } else {
      // Гость - используем sessionId
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID обязателен для неавторизованных пользователей' });
      }
      
      const cartData = await Cart.getBySessionId(sessionId);
      if (!cartData) {
        cart = new Cart({ sessionId });
      } else {
        cart = new Cart(cartData);
      }
    }

    // Добавляем товар в корзину
    cart.addItem(productId, quantity, {
      name: product.name,
      price: product.price,
      image: product.images[0] || '/placeholder.svg'
    });

    await cart.save();

    res.json({
      message: 'Товар добавлен в корзину',
      cart: {
        totalItems: cart.getTotalItems(),
        totalPrice: cart.getTotalPrice()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить количество товара в корзине
router.put('/update', optionalAuth, [
  body('productId').notEmpty().withMessage('ID товара обязателен'),
  body('quantity').isInt({ min: 0 }).withMessage('Количество должно быть неотрицательным числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId, quantity } = req.body;
    
    let cart;
    
    if (req.user) {
      cart = await Cart.getByUserId(req.user.id);
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID обязателен для неавторизованных пользователей' });
      }
      cart = await Cart.getBySessionId(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    if (quantity > 0) {
      // Проверяем наличие товара на складе
      const product = await Product.getById(productId);
      if (!product || !product.isActive) {
        return res.status(404).json({ error: 'Товар не найден' });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ 
          error: `Недостаточно товара на складе. Доступно: ${product.stock}` 
        });
      }
    }

    const cartInstance = new Cart(cart);
    cartInstance.updateItemQuantity(productId, quantity);
    await cartInstance.save();

    res.json({
      message: 'Корзина обновлена',
      cart: {
        totalItems: cartInstance.getTotalItems(),
        totalPrice: cartInstance.getTotalPrice()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить товар из корзины
router.delete('/remove', optionalAuth, [
  body('productId').notEmpty().withMessage('ID товара обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.body;
    
    let cart;
    
    if (req.user) {
      cart = await Cart.getByUserId(req.user.id);
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID обязателен для неавторизованных пользователей' });
      }
      cart = await Cart.getBySessionId(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    const cartInstance = new Cart(cart);
    cartInstance.removeItem(productId);
    await cartInstance.save();

    res.json({
      message: 'Товар удален из корзины',
      cart: {
        totalItems: cartInstance.getTotalItems(),
        totalPrice: cartInstance.getTotalPrice()
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Очистить корзину
router.delete('/clear', optionalAuth, async (req, res) => {
  try {
    let cart;
    
    if (req.user) {
      cart = await Cart.getByUserId(req.user.id);
    } else {
      const sessionId = req.headers['x-session-id'];
      if (!sessionId) {
        return res.status(400).json({ error: 'Session ID обязателен для неавторизованных пользователей' });
      }
      cart = await Cart.getBySessionId(sessionId);
    }

    if (!cart) {
      return res.status(404).json({ error: 'Корзина не найдена' });
    }

    const cartInstance = new Cart(cart);
    cartInstance.clear();
    await cartInstance.save();

    res.json({ message: 'Корзина очищена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Объединить корзины (при авторизации)
router.post('/merge', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    if (!userId || !sessionId) {
      return res.status(400).json({ error: 'userId и sessionId обязательны' });
    }

    const cart = await Cart.merge(userId, sessionId);
    res.json({ message: 'Корзины объединены', cart });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

