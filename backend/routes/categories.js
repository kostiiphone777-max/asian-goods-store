const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { JWT_SECRET } = require('../config/jwt');
const jwt = require('jsonwebtoken');

const router = express.Router();

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

// Middleware для проверки роли администратора
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуется роль администратора' });
  }
  next();
};

// Получить все категории
router.get('/', async (req, res) => {
  try {
    const { tree = false } = req.query;
    
    if (tree === 'true') {
      const categories = await Category.getTree();
      res.json(categories);
    } else {
      const categories = await Category.getAll();
      res.json(categories);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить корневые категории
router.get('/root', async (req, res) => {
  try {
    const categories = await Category.getRootCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить категорию по ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить категорию по slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const category = await Category.getBySlug(req.params.slug);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить подкатегории
router.get('/:id/children', async (req, res) => {
  try {
    const categories = await Category.getByParent(req.params.id);
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить товары категории
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const products = await Product.getByCategory(req.params.id);
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedProducts = products.slice(startIndex, endIndex);

    res.json({
      products: paginatedProducts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(products.length / limit),
        totalItems: products.length,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Создать категорию (только для админов)
router.post('/', authenticateToken, requireAdmin, [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('description').notEmpty().withMessage('Описание обязательно')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить категорию (только для админов)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().notEmpty().withMessage('Название не может быть пустым'),
  body('description').optional().notEmpty().withMessage('Описание не может быть пустым'),
  body('parentId').optional().custom((value) => {
    if (value !== null && value !== undefined && value !== '') {
      // Если значение не null/undefined/пустое, проверяем что это валидный UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(value)) {
        throw new Error('Invalid parentId format');
      }
    }
    return true;
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const categoryData = await Category.getById(req.params.id);
    if (!categoryData) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    // Создаем экземпляр класса Category
    const category = new Category(categoryData);
    
    // Обновляем поля
    Object.assign(category, req.body);
    category.updatedAt = new Date().toISOString();
    
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить категорию (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const category = await Category.getById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    // Проверяем, есть ли товары в этой категории
    const products = await Product.getByCategory(req.params.id);
    if (products.length > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить категорию, в которой есть товары' 
      });
    }

    // Проверяем, есть ли подкатегории
    const children = await Category.getByParent(req.params.id);
    if (children.length > 0) {
      return res.status(400).json({ 
        error: 'Нельзя удалить категорию, у которой есть подкатегории' 
      });
    }

    await Category.delete(req.params.id);
    res.json({ message: 'Категория удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

