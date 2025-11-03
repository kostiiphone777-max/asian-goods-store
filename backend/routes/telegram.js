const express = require('express');
const { body, validationResult } = require('express-validator');
const TelegramSettings = require('../models/TelegramSettings');
const telegramService = require('../services/telegram-service');
const db = require('../database/database');
const User = require('../models/User');

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

// Middleware для проверки прав администратора
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ запрещен. Требуется роль администратора' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Получить настройки Telegram
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = await TelegramSettings.get();
    if (!settings) {
      return res.json({
        id: null,
        botToken: '',
        chatId: '',
        isEnabled: false
      });
    }
    
    // Скрываем токен для безопасности (показываем только последние 4 символа)
    const maskedToken = settings.botToken 
      ? settings.botToken.slice(0, 10) + '...' + settings.botToken.slice(-4)
      : '';
    
    res.json({
      id: settings.id,
      botToken: settings.botToken ? maskedToken : '', // Показываем замаскированный токен
      chatId: settings.chatId || '',
      isEnabled: settings.isEnabled ? true : false,
      fullBotToken: settings.botToken ? true : false // Для проверки наличия токена (безопасность)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Сохранить настройки Telegram
router.post('/', authenticateToken, requireAdmin, [
  body('botToken').notEmpty().withMessage('Токен бота обязателен'),
  body('chatId').notEmpty().withMessage('ID чата/канала обязателен'),
  body('isEnabled').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { botToken, chatId, isEnabled = false } = req.body;

    const settings = new TelegramSettings({
      botToken,
      chatId,
      isEnabled
    });

    await settings.save();

    // Перезагружаем настройки в сервисе
    await telegramService.loadSettings();

    // Скрываем токен для ответа
    const maskedToken = botToken.slice(0, 10) + '...' + botToken.slice(-4);

    res.json({
      ...settings,
      botToken: maskedToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить настройки Telegram
router.put('/', authenticateToken, requireAdmin, [
  body('botToken').optional().notEmpty().withMessage('Токен бота не может быть пустым'),
  body('chatId').optional().notEmpty().withMessage('ID чата/канала не может быть пустым'),
  body('isEnabled').optional().isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const existingSettings = await TelegramSettings.get();
    if (!existingSettings) {
      return res.status(404).json({ error: 'Настройки не найдены. Создайте новые настройки.' });
    }

    // Обновляем только переданные поля
    if (req.body.botToken !== undefined) {
      existingSettings.botToken = req.body.botToken;
    }
    if (req.body.chatId !== undefined) {
      existingSettings.chatId = req.body.chatId;
    }
    if (req.body.isEnabled !== undefined) {
      existingSettings.isEnabled = req.body.isEnabled;
    }

    await existingSettings.save();

    // Перезагружаем настройки в сервисе
    await telegramService.loadSettings();

    // Скрываем токен для ответа
    const maskedToken = existingSettings.botToken 
      ? existingSettings.botToken.slice(0, 10) + '...' + existingSettings.botToken.slice(-4)
      : '';

    res.json({
      ...existingSettings,
      botToken: maskedToken
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Тест подключения Telegram
router.post('/test', authenticateToken, requireAdmin, [
  body('botToken').notEmpty().withMessage('Токен бота обязателен'),
  body('chatId').notEmpty().withMessage('ID чата/канала обязателен')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { botToken, chatId } = req.body;
    const result = await telegramService.testConnection(botToken, chatId);
    
    if (result.success) {
      res.json({ success: true, message: result.message });
    } else {
      res.status(400).json({ success: false, message: result.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

