const TelegramBot = require('node-telegram-bot-api');
const db = require('../database/database');

class TelegramService {
  constructor() {
    this.bot = null;
    this.settings = null;
  }

  // Загрузка настроек из базы данных
  async loadSettings() {
    try {
      const settings = await db.get(
        'SELECT * FROM telegram_settings ORDER BY id DESC LIMIT 1'
      );
      
      if (settings && settings.isEnabled && settings.botToken) {
        // Инициализируем бота только если токен изменился или бот не создан
        if (!this.bot || this.settings?.botToken !== settings.botToken) {
          this.bot = new TelegramBot(settings.botToken, { polling: false });
        }
        this.settings = settings;
        return true;
      }
      
      this.settings = null;
      return false;
    } catch (error) {
      console.error('Ошибка загрузки настроек Telegram:', error);
      return false;
    }
  }

  // Отправка уведомления о новом заказе
  async sendOrderNotification(order, user) {
    try {
      // Загружаем настройки перед отправкой
      const isEnabled = await this.loadSettings();
      
      if (!isEnabled || !this.bot || !this.settings.chatId) {
        console.log('Telegram уведомления отключены или не настроены');
        return false;
      }

      const shippingAddress = typeof order.shippingAddress === 'string' 
        ? JSON.parse(order.shippingAddress) 
        : order.shippingAddress;

      const items = typeof order.items === 'string' 
        ? JSON.parse(order.items) 
        : order.items;

      // Формируем сообщение
      let message = `🛍️ *НОВЫЙ ЗАКАЗ*\n\n`;
      message += `📦 *Номер заказа:* ${order.orderNumber}\n`;
      message += `👤 *Клиент:* ${user.firstName} ${user.lastName}\n`;
      message += `📧 *Email:* ${user.email}\n\n`;
      
      message += `📋 *Товары:*\n`;
      items.forEach((item, index) => {
        message += `${index + 1}. ${item.name || 'Товар'} x${item.quantity} - ${item.price * item.quantity} ₽\n`;
      });
      
      message += `\n💰 *Итого:* ${order.total} ₽\n`;
      message += `📦 *Доставка:* ${order.shippingCost || 0} ₽\n`;
      message += `💳 *Оплата:* ${order.paymentMethod || 'Не указано'}\n\n`;
      
      message += `📍 *Адрес доставки:*\n`;
      if (shippingAddress) {
        message += `${shippingAddress.address || ''}\n`;
        if (shippingAddress.city) message += `Город: ${shippingAddress.city}\n`;
        if (shippingAddress.postalCode) message += `Индекс: ${shippingAddress.postalCode}\n`;
        if (shippingAddress.phone) message += `Телефон: ${shippingAddress.phone}\n`;
      }
      
      if (order.notes) {
        message += `\n📝 *Комментарий:* ${order.notes}\n`;
      }
      
      message += `\n⏰ *Дата:* ${new Date(order.createdAt).toLocaleString('ru-RU')}`;

      // Отправляем сообщение
      await this.bot.sendMessage(this.settings.chatId, message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true 
      });

      console.log(`✅ Уведомление о заказе ${order.orderNumber} отправлено в Telegram`);
      return true;
    } catch (error) {
      console.error('Ошибка отправки уведомления в Telegram:', error);
      return false;
    }
  }

  // Проверка подключения (тест)
  async testConnection(botToken, chatId) {
    try {
      const testBot = new TelegramBot(botToken, { polling: false });
      const testMessage = '✅ Тест подключения Telegram бота. Все работает!';
      await testBot.sendMessage(chatId, testMessage);
      return { success: true, message: 'Подключение успешно!' };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Ошибка подключения к Telegram' 
      };
    }
  }
}

module.exports = new TelegramService();

