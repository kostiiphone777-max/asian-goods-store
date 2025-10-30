const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

class Cart {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.userId = data.userId;
    this.sessionId = data.sessionId;
    this.items = data.items || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  addItem(productId, quantity = 1, productData = {}) {
    const existingItem = this.items.find(item => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      this.items.push({
        id: uuidv4(),
        productId,
        quantity,
        ...productData
      });
    }
    
    this.updatedAt = new Date().toISOString();
    return this;
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.productId !== productId);
    this.updatedAt = new Date().toISOString();
    return this;
  }

  updateItemQuantity(productId, quantity) {
    const item = this.items.find(item => item.productId === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        item.quantity = quantity;
        this.updatedAt = new Date().toISOString();
      }
    }
    return this;
  }

  clear() {
    this.items = [];
    this.updatedAt = new Date().toISOString();
    return this;
  }

  getTotalItems() {
    return this.items.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice() {
    return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  static async getByUserId(userId) {
    try {
      const cart = await db.get('SELECT * FROM cart_items WHERE userId = ?', [userId]);
      if (!cart) return null;
      
      return {
        id: cart.id,
        userId: cart.userId,
        items: JSON.parse(cart.items || '[]'),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      };
    } catch (error) {
      console.error('Ошибка получения корзины пользователя:', error);
      return null;
    }
  }

  static async getBySessionId(sessionId) {
    try {
      const cart = await db.get('SELECT * FROM cart_items WHERE sessionId = ?', [sessionId]);
      if (!cart) return null;
      
      return {
        id: cart.id,
        sessionId: cart.sessionId,
        items: JSON.parse(cart.items || '[]'),
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt
      };
    } catch (error) {
      console.error('Ошибка получения корзины по сессии:', error);
      return null;
    }
  }

  static async create(userId, sessionId = null) {
    try {
      const cart = new Cart({ userId, sessionId });
      await cart.save();
      return cart;
    } catch (error) {
      console.error('Ошибка создания корзины:', error);
      throw error;
    }
  }

  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      
      await db.run(
        `INSERT OR REPLACE INTO cart_items 
         (id, userId, sessionId, items, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          this.id, this.userId, this.sessionId, 
          JSON.stringify(this.items), this.createdAt, this.updatedAt
        ]
      );
      
      return this;
    } catch (error) {
      console.error('Ошибка сохранения корзины:', error);
      throw error;
    }
  }

  static async delete(userId = null, sessionId = null) {
    try {
      if (userId) {
        await db.run('DELETE FROM cart_items WHERE userId = ?', [userId]);
      } else if (sessionId) {
        await db.run('DELETE FROM cart_items WHERE sessionId = ?', [sessionId]);
      }
      return true;
    } catch (error) {
      console.error('Ошибка удаления корзины:', error);
      throw error;
    }
  }

  static async merge(userId, sessionId) {
    try {
      const userCart = await this.getByUserId(userId);
      const sessionCart = await this.getBySessionId(sessionId);
      
      if (!sessionCart) return userCart;
      
      if (!userCart) {
        // Создаем корзину пользователя из сессионной
        const newCart = new Cart({
          userId,
          items: sessionCart.items,
          createdAt: sessionCart.createdAt,
          updatedAt: new Date().toISOString()
        });
        await newCart.save();
        await this.delete(null, sessionId);
        return newCart;
      }
      
      // Объединяем корзины
      const mergedItems = [...userCart.items];
      
      sessionCart.items.forEach(sessionItem => {
        const existingItem = mergedItems.find(item => item.productId === sessionItem.productId);
        if (existingItem) {
          existingItem.quantity += sessionItem.quantity;
        } else {
          mergedItems.push(sessionItem);
        }
      });
      
      userCart.items = mergedItems;
      userCart.updatedAt = new Date().toISOString();
      await userCart.save();
      
      // Удаляем сессионную корзину
      await this.delete(null, sessionId);
      
      return userCart;
    } catch (error) {
      console.error('Ошибка объединения корзин:', error);
      throw error;
    }
  }
}

module.exports = Cart;