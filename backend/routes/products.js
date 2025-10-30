const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Product = require('../models/Product');
const Category = require('../models/Category');
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

// Получить все товары с фильтрацией и поиском
router.get('/', async (req, res) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      sortOrder,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {
      categoryId,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      inStock: inStock === 'true',
      sortBy,
      sortOrder
    };

    const products = await Product.search(search, filters);
    
    // Пагинация
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

// Получить товар по ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить товар по slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const product = await Product.getBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить товары по категории
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const products = await Product.getByCategory(req.params.categoryId);
    
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

// Создать новый товар
router.post('/', [
  body('name').notEmpty().withMessage('Название товара обязательно'),
  body('price').isNumeric().withMessage('Цена должна быть числом'),
  body('categoryId').notEmpty().withMessage('Категория обязательна'),
  body('description').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Проверяем существование категории
    const category = await Category.getById(req.body.categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Категория не найдена' });
    }

    const product = new Product(req.body);
    await product.save();
    
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить товар
router.put('/:id', [
  body('name').optional().notEmpty(),
  body('price').optional().isNumeric(),
  body('categoryId').optional().notEmpty(),
  body('description').optional().isString(),
  body('stock').optional().isInt({ min: 0 }),
  body('images').optional().isArray(),
  body('tags').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Проверяем существование категории, если она указана
    if (req.body.categoryId) {
      const category = await Category.getById(req.body.categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Категория не найдена' });
      }
    }

    Object.assign(product, req.body);
    await product.save();
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить количество товара на складе
router.patch('/:id/stock', [
  body('quantity').isInt({ min: 0 }).withMessage('Количество должно быть положительным числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.updateStock(req.params.id, req.body.quantity);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить товар
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await Product.delete(req.params.id);
    res.json({ message: 'Товар удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Получить похожие товары
router.get('/:id/similar', async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    const similarProducts = await Product.search('', {
      categoryId: product.categoryId
    });

    // Исключаем текущий товар и возвращаем до 4 похожих
    const filtered = similarProducts
      .filter(p => p.id !== product.id)
      .slice(0, 4);

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Создать товар (только для админов)
router.post('/', authenticateToken, requireAdmin, [
  body('name').notEmpty().withMessage('Название обязательно'),
  body('description').notEmpty().withMessage('Описание обязательно'),
  body('price').isNumeric().withMessage('Цена должна быть числом'),
  body('categoryId').notEmpty().withMessage('Категория обязательна')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обновить товар (только для админов)
router.put('/:id', authenticateToken, requireAdmin, [
  body('name').optional().notEmpty().withMessage('Название не может быть пустым'),
  body('description').optional().notEmpty().withMessage('Описание не может быть пустым'),
  body('price').optional().isNumeric().withMessage('Цена должна быть числом')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Обновляем поля
    Object.assign(product, req.body);
    product.updatedAt = new Date().toISOString();
    
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Удалить товар (только для админов)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    await Product.delete(req.params.id);
    res.json({ message: 'Товар удален' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

