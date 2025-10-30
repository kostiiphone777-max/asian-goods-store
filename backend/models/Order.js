const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

class Order {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.orderNumber = data.orderNumber || this.generateOrderNumber();
    this.userId = data.userId;
    this.status = data.status || 'pending';
    this.items = data.items || [];
    this.subtotal = data.subtotal || 0;
    this.shippingCost = data.shippingCost || 0;
    this.tax = data.tax || 0;
    this.total = data.total || 0;
    this.shippingAddress = data.shippingAddress;
    this.billingAddress = data.billingAddress;
    this.paymentMethod = data.paymentMethod;
    this.paymentStatus = data.paymentStatus || 'pending';
    this.notes = data.notes || '';
    this.trackingNumber = data.trackingNumber || null;
    this.shippedAt = data.shippedAt || null;
    this.deliveredAt = data.deliveredAt || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  generateOrderNumber() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AG${timestamp}${random}`;
  }

  calculateTotals() {
    this.subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    this.tax = 0; // НДС уже включен в цену товара
    this.total = this.subtotal + this.shippingCost; // Доставка будет рассчитываться при оформлении
    return this;
  }

  static async getAll() {
    try {
      const orders = await db.all('SELECT * FROM orders ORDER BY createdAt DESC');
      return orders.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        shippingAddress: JSON.parse(order.shippingAddress || '{}'),
        billingAddress: JSON.parse(order.billingAddress || '{}')
      }));
    } catch (error) {
      console.error('Ошибка получения заказов:', error);
      return [];
    }
  }

  static async getById(id) {
    try {
      const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) return null;
      
      const items = JSON.parse(order.items || '[]');
      
      // Получаем полную информацию о товарах
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await db.get('SELECT id, name, description, images, slug FROM products WHERE id = ?', [item.productId]);
            if (product) {
              return {
                ...item,
                name: product.name,
                description: product.description,
                image: product.images ? JSON.parse(product.images)[0] : '/placeholder.jpg',
                slug: product.slug
              };
            }
            return item;
          } catch (error) {
            console.error(`Ошибка получения товара ${item.productId}:`, error);
            return item;
          }
        })
      );
      
      return {
        ...order,
        items: enrichedItems,
        shippingAddress: JSON.parse(order.shippingAddress || '{}'),
        billingAddress: JSON.parse(order.billingAddress || '{}')
      };
    } catch (error) {
      console.error('Ошибка получения заказа:', error);
      return null;
    }
  }

  static async getByOrderNumber(orderNumber) {
    try {
      const order = await db.get('SELECT * FROM orders WHERE orderNumber = ?', [orderNumber]);
      if (!order) return null;
      
      const items = JSON.parse(order.items || '[]');
      
      // Получаем полную информацию о товарах
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await db.get('SELECT id, name, description, images, slug FROM products WHERE id = ?', [item.productId]);
            if (product) {
              return {
                ...item,
                name: product.name,
                description: product.description,
                image: product.images ? JSON.parse(product.images)[0] : '/placeholder.jpg',
                slug: product.slug
              };
            }
            return item;
          } catch (error) {
            console.error(`Ошибка получения товара ${item.productId}:`, error);
            return item;
          }
        })
      );
      
      return {
        ...order,
        items: enrichedItems,
        shippingAddress: JSON.parse(order.shippingAddress || '{}'),
        billingAddress: JSON.parse(order.billingAddress || '{}')
      };
    } catch (error) {
      console.error('Ошибка получения заказа по номеру:', error);
      return null;
    }
  }

  static async getByUserId(userId) {
    try {
      const orders = await db.all(
        'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
      return orders.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        shippingAddress: JSON.parse(order.shippingAddress || '{}'),
        billingAddress: JSON.parse(order.billingAddress || '{}')
      }));
    } catch (error) {
      console.error('Ошибка получения заказов пользователя:', error);
      return [];
    }
  }

  static async getByStatus(status) {
    try {
      const orders = await db.all(
        'SELECT * FROM orders WHERE status = ? ORDER BY createdAt DESC',
        [status]
      );
      return orders.map(order => ({
        ...order,
        items: JSON.parse(order.items || '[]'),
        shippingAddress: JSON.parse(order.shippingAddress || '{}'),
        billingAddress: JSON.parse(order.billingAddress || '{}')
      }));
    } catch (error) {
      console.error('Ошибка получения заказов по статусу:', error);
      return [];
    }
  }

  static async getStats() {
    try {
      const orders = await db.all('SELECT status, total FROM orders');
      const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        processing: orders.filter(o => o.status === 'processing').length,
        shipped: orders.filter(o => o.status === 'shipped').length,
        delivered: orders.filter(o => o.status === 'delivered').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue: orders
          .filter(o => o.status === 'delivered')
          .reduce((sum, o) => sum + o.total, 0)
      };
      return stats;
    } catch (error) {
      console.error('Ошибка получения статистики заказов:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0
      };
    }
  }

  static async getProductPopularity() {
    try {
      const orders = await db.all('SELECT items FROM orders WHERE status != "cancelled"');
      const productStats = {};
      
      orders.forEach(order => {
        const items = JSON.parse(order.items || '[]');
        items.forEach(item => {
          if (productStats[item.productId]) {
            productStats[item.productId].totalQuantity += item.quantity;
            productStats[item.productId].orderCount += 1;
            productStats[item.productId].totalRevenue += item.price * item.quantity;
          } else {
            productStats[item.productId] = {
              productId: item.productId,
              totalQuantity: item.quantity,
              orderCount: 1,
              totalRevenue: item.price * item.quantity
            };
          }
        });
      });
      
      // Получаем информацию о товарах
      const productIds = Object.keys(productStats);
      const products = await Promise.all(
        productIds.map(async (productId) => {
          try {
            const product = await db.get('SELECT id, name, images, price, stock, rating FROM products WHERE id = ?', [productId]);
            if (product) {
              return {
                ...productStats[productId],
                name: product.name,
                images: product.images ? JSON.parse(product.images) : [],
                price: product.price,
                stock: product.stock,
                rating: product.rating,
                popularityScore: productStats[productId].totalQuantity * 2 + productStats[productId].orderCount
              };
            }
            return null;
          } catch (error) {
            console.error(`Ошибка получения товара ${productId}:`, error);
            return null;
          }
        })
      );
      
      return products
        .filter(p => p !== null)
        .sort((a, b) => b.popularityScore - a.popularityScore);
    } catch (error) {
      console.error('Ошибка получения популярности товаров:', error);
      return [];
    }
  }

  async save() {
    try {
      this.updatedAt = new Date().toISOString();
      
      await db.run(
        `INSERT OR REPLACE INTO orders 
         (id, orderNumber, userId, status, items, subtotal, shippingCost, tax, total, 
          shippingAddress, billingAddress, paymentMethod, paymentStatus, notes, 
          trackingNumber, shippedAt, deliveredAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          this.id, this.orderNumber, this.userId, this.status,
          JSON.stringify(this.items), this.subtotal, this.shippingCost, this.tax, this.total,
          JSON.stringify(this.shippingAddress), JSON.stringify(this.billingAddress),
          this.paymentMethod, this.paymentStatus, this.notes,
          this.trackingNumber, this.shippedAt, this.deliveredAt,
          this.createdAt, this.updatedAt
        ]
      );
      
      return this;
    } catch (error) {
      console.error('Ошибка сохранения заказа:', error);
      throw error;
    }
  }

  async updateStatus(status, additionalData = {}) {
    this.status = status;
    this.updatedAt = new Date().toISOString();
    
    if (status === 'shipped' && !this.shippedAt) {
      this.shippedAt = new Date().toISOString();
    }
    
    if (status === 'delivered' && !this.deliveredAt) {
      this.deliveredAt = new Date().toISOString();
    }
    
    Object.assign(this, additionalData);
    
    await this.save();
    return this;
  }

  static async delete(id) {
    try {
      await db.run('DELETE FROM orders WHERE id = ?', [id]);
      return true;
    } catch (error) {
      console.error('Ошибка удаления заказа:', error);
      throw error;
    }
  }
}

module.exports = Order;