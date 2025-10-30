const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

const { JWT_SECRET } = require('../config/jwt');

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Регистрация пользователя
router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль должен содержать минимум 6 символов'),
  body('firstName').notEmpty().withMessage('Имя обязательно'),
  body('lastName').notEmpty().withMessage('Фамилия обязательна')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.create(req.body);
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Вход пользователя
router.post('/login', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').notEmpty().withMessage('Пароль обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.getByEmail(email);

    if (!user || !await user.validatePassword(password)) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Аккаунт заблокирован' });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      user: user.toJSON(),
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить профиль пользователя
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить профиль пользователя
router.put('/profile', authenticateToken, [
  body('firstName').optional().notEmpty(),
  body('lastName').optional().notEmpty(),
  body('phone').optional().isMobilePhone('ru-RU'),
  body('preferences').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const { password, ...updateData } = req.body;
    Object.assign(user, updateData);
    await user.save();

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Изменить пароль
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty().withMessage('Текущий пароль обязателен'),
  body('newPassword').isLength({ min: 6 }).withMessage('Новый пароль должен содержать минимум 6 символов')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await User.getById(req.user.userId);

    if (!user || !await user.validatePassword(currentPassword)) {
      return res.status(401).json({ error: 'Неверный текущий пароль' });
    }

    await user.updatePassword(newPassword);
    res.json({ message: 'Пароль успешно изменен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Добавить адрес
router.post('/addresses', authenticateToken, [
  body('street').notEmpty().withMessage('Улица обязательна'),
  body('city').notEmpty().withMessage('Город обязателен'),
  body('postalCode').notEmpty().withMessage('Почтовый индекс обязателен'),
  body('country').notEmpty().withMessage('Страна обязательна')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const address = user.addAddress(req.body);
    await user.save();

    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить адрес
router.put('/addresses/:addressId', authenticateToken, [
  body('street').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('postalCode').optional().notEmpty(),
  body('country').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    const address = user.updateAddress(req.params.addressId, req.body);
    if (!address) {
      return res.status(404).json({ error: 'Адрес не найден' });
    }

    await user.save();
    res.json(address);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить адрес
router.delete('/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.deleteAddress(req.params.addressId);
    await user.save();

    res.json({ message: 'Адрес удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Установить адрес по умолчанию
router.put('/addresses/:addressId/default', authenticateToken, async (req, res) => {
  try {
    const user = await User.getById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    user.setDefaultAddress(req.params.addressId);
    await user.save();

    res.json({ message: 'Адрес установлен по умолчанию' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить всех пользователей (только для админов)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.getById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    const users = await User.getAll();
    res.json(users.map(u => u.toJSON()));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


