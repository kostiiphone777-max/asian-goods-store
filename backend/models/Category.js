const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

class Category {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.slug = data.slug || this.generateSlug(data.name);
    this.description = data.description;
    this.image = data.image;
    this.parentId = data.parentId || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.sortOrder = data.sortOrder || 0;
    this.metaTitle = data.metaTitle || data.name;
    this.metaDescription = data.metaDescription || data.description;
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
      const categories = await db.all('SELECT * FROM categories ORDER BY sortOrder ASC, name ASC');
      return categories;
    } catch (error) {
      console.error('Ошибка получения категорий:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const category = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
      return category;
    } catch (error) {
      console.error('Ошибка получения категории:', error);
      return null;
    }
  }

  static async getBySlug(slug) {
    try {
      const category = await db.get('SELECT * FROM categories WHERE slug = ?', [slug]);
      return category;
    } catch (error) {
      console.error('Ошибка получения категории по slug:', error);
      return null;
    }
  }

  static async getByParent(parentId) {
    try {
      const categories = await db.all(
        'SELECT * FROM categories WHERE parentId = ? AND isActive = 1 ORDER BY sortOrder ASC, name ASC',
        [parentId]
      );
      return categories;
    } catch (error) {
      console.error('Ошибка получения подкатегорий:', error);
      return [];
    }
  }

  static async getRoot() {
    try {
      const categories = await db.all(
        'SELECT * FROM categories WHERE parentId IS NULL AND isActive = 1 ORDER BY sortOrder ASC, name ASC'
      );
      return categories;
    } catch (error) {
      console.error('Ошибка получения корневых категорий:', error);
      return [];
    }
  }

  static async getTree() {
    try {
      const categories = await this.getAll();
      const categoryMap = new Map();
      const rootCategories = [];

      // Создаем карту категорий
      categories.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Строим дерево
      categories.forEach(category => {
        if (category.parentId) {
          const parent = categoryMap.get(category.parentId);
          if (parent) {
            parent.children.push(categoryMap.get(category.id));
          }
        } else {
          rootCategories.push(categoryMap.get(category.id));
        }
      });

      return rootCategories;
    } catch (error) {
      console.error('Ошибка построения дерева категорий:', error);
      return [];
    }
  }

  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      
      await db.run(
        `INSERT OR REPLACE INTO categories 
         (id, name, slug, description, image, parentId, isActive, sortOrder, 
          metaTitle, metaDescription, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.id, this.name, this.slug, this.description, this.image,
          this.parentId, this.isActive, this.sortOrder, this.metaTitle,
          this.metaDescription, this.createdAt, this.updatedAt
        ]
      );
      
      return this;
    } catch (error) {
      console.error('Ошибка сохранения категории:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await db.run('DELETE FROM categories WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Ошибка удаления категории:', error);
      throw error;
    }
  }
}

module.exports = Category;