const express = require('express');
const User = require('../models/User');
const router = express.Router();

// Регистрация
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Валидация
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Все поля обязательны для заполнения' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Пароль должен содержать минимум 6 символов' 
      });
    }

    // Создаем пользователя
    const user = await User.create({
      email,
      password,
      firstName,
      lastName
    });

    // Генерируем токен
    const token = User.generateToken(user);

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user,
      token
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(400).json({ error: error.message });
  }
});

// Вход
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Валидация
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email и пароль обязательны' 
      });
    }

    // Находим пользователя
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Проверяем пароль
    const isValidPassword = await User.validatePassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Неверный email или пароль' 
      });
    }

    // Генерируем токен
    const token = User.generateToken(user);

    // Возвращаем пользователя без пароля
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Успешный вход в систему',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

// Получение профиля пользователя
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = User.verifyToken(token);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    // Возвращаем пользователя без пароля
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(401).json({ error: 'Недействительный токен' });
  }
});

// Обновление профиля
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Токен не предоставлен' });
    }

    const decoded = User.verifyToken(token);
    const { firstName, lastName, email } = req.body;

    const updatedUser = await User.update(decoded.id, {
      firstName,
      lastName,
      email
    });

    // Возвращаем пользователя без пароля
    const { password, ...userWithoutPassword } = updatedUser;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(400).json({ error: error.message });
  }
});

// Выход (на клиенте просто удаляем токен)
router.post('/logout', (req, res) => {
  res.json({ message: 'Успешный выход из системы' });
});

module.exports = router;

