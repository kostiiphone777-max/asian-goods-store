const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

class Product {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.originalPrice = data.originalPrice;
    this.categoryId = data.categoryId;
    this.slug = data.slug || this.generateSlug(data.name);
    this.images = data.images || [];
    this.badge = data.badge || null;
    this.stock = data.stock || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.tags = data.tags || [];
    this.rating = data.rating || 0;
    this.reviewCount = data.reviewCount || 0;
    this.weight = data.weight || null;
    this.dimensions = data.dimensions || null;
    this.country = data.country || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateSlug(name) {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  static async getAll() {
    try {
      const products = await db.all('SELECT * FROM products ORDER BY createdAt DESC');
      return products.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]')
      }));
    } catch (error) {
      console.error('Ошибка получения товаров:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const product = await db.get('SELECT * FROM products WHERE id = ?', [id]);
      if (!product) return null;
      
      return {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]')
      };
    } catch (error) {
      console.error('Ошибка получения товара:', error);
      return null;
    }
  }

  static async getBySlug(slug) {
    try {
      const product = await db.get('SELECT * FROM products WHERE slug = ?', [slug]);
      if (!product) return null;
      
      return {
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]')
      };
    } catch (error) {
      console.error('Ошибка получения товара по slug:', error);
      return null;
    }
  }

  static async getByCategory(categoryId, page = 1, limit = 20) {
    try {
      const offset = (page - 1) * limit;
      const products = await db.all(
        'SELECT * FROM products WHERE categoryId = ? AND isActive = 1 ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [categoryId, limit, offset]
      );
      return products.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]')
      }));
    } catch (error) {
      console.error('Ошибка получения товаров по категории:', error);
      return [];
    }
  }

  static async search(query, filters = {}) {
    try {
      let sql = 'SELECT * FROM products WHERE isActive = 1';
      const params = [];

      if (query) {
        sql += ' AND (name LIKE ? OR description LIKE ?)';
        const searchTerm = `%${query}%`;
        params.push(searchTerm, searchTerm);
      }

      if (filters.categoryId) {
        sql += ' AND categoryId = ?';
        params.push(filters.categoryId);
      }

      if (filters.minPrice) {
        sql += ' AND price >= ?';
        params.push(filters.minPrice);
      }

      if (filters.maxPrice) {
        sql += ' AND price <= ?';
        params.push(filters.maxPrice);
      }

      if (filters.inStock) {
        sql += ' AND stock > 0';
      }

      if (filters.sortBy) {
        const order = filters.sortOrder === 'desc' ? 'DESC' : 'ASC';
        sql += ` ORDER BY ${filters.sortBy} ${order}`;
      } else {
        sql += ' ORDER BY createdAt DESC';
      }

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

      if (filters.offset) {
        sql += ' OFFSET ?';
        params.push(filters.offset);
      }

      const products = await db.all(sql, params);
      return products.map(product => ({
        ...product,
        images: JSON.parse(product.images || '[]'),
        tags: JSON.parse(product.tags || '[]')
      }));
    } catch (error) {
      console.error('Ошибка поиска товаров:', error);
      return [];
    }
  }

  static async getSimilar(id, limit = 4) {
    try {
      const product = await this.getById(id);
      if (!product) return [];

      const similar = await db.all(
        `SELECT * FROM products 
         WHERE categoryId = ? AND id != ? AND isActive = 1 
         ORDER BY rating DESC 
         LIMIT ?`,
        [product.categoryId, id, limit]
      );
      
      return similar.map(p => ({
        ...p,
        images: JSON.parse(p.images || '[]'),
        tags: JSON.parse(p.tags || '[]')
      }));
    } catch (error) {
      console.error('Ошибка получения похожих товаров:', error);
      return [];
    }
  }

  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      
      await db.run(
        `INSERT OR REPLACE INTO products 
         (id, name, description, price, originalPrice, categoryId, slug, images, 
          badge, stock, isActive, tags, rating, reviewCount, weight, dimensions, 
          country, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.id, this.name, this.description, this.price, this.originalPrice,
          this.categoryId, this.slug, JSON.stringify(this.images), this.badge,
          this.stock, this.isActive, JSON.stringify(this.tags), this.rating,
          this.reviewCount, this.weight, this.dimensions, this.country,
          this.createdAt, this.updatedAt
        ]
      );
      
      return this;
    } catch (error) {
      console.error('Ошибка сохранения товара:', error);
      throw error;
    }
  }

  static async updateStock(id, quantity) {
    try {
      await db.run(
        'UPDATE products SET stock = stock - ?, updatedAt = ? WHERE id = ?',
        [quantity, new Date().toISOString(), id]
      );
      return true;
    } catch (error) {
      console.error('Ошибка обновления остатков:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.run('DELETE FROM products WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      throw error;
    }
  }
}

module.exports = Product;