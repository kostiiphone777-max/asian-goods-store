const db = require('../database/database');

class TelegramSettings {
  constructor(data) {
    this.id = data.id || null;
    this.botToken = data.botToken || null;
    this.chatId = data.chatId || null;
    this.isEnabled = data.isEnabled !== undefined ? data.isEnabled : false;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  // Получить настройки
  static async get() {
    try {
      const settings = await db.get(
        'SELECT * FROM telegram_settings ORDER BY id DESC LIMIT 1'
      );
      return settings ? new TelegramSettings(settings) : null;
    } catch (error) {
      console.error('Ошибка получения настроек Telegram:', error);
      throw error;
    }
  }

  // Сохранить настройки
  async save() {
    try {
      this.updatedAt = new Date().toISOString();

      const existing = await db.get(
        'SELECT id FROM telegram_settings ORDER BY id DESC LIMIT 1'
      );

      if (existing) {
        // Обновляем существующие настройки
        await db.run(
          `UPDATE telegram_settings 
           SET botToken = ?, chatId = ?, isEnabled = ?, updatedAt = ?
           WHERE id = ?`,
          [this.botToken, this.chatId, this.isEnabled ? 1 : 0, this.updatedAt, existing.id]
        );
        this.id = existing.id;
      } else {
        // Создаем новые настройки
        this.createdAt = new Date().toISOString();
        const result = await db.run(
          `INSERT INTO telegram_settings (botToken, chatId, isEnabled, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?)`,
          [this.botToken, this.chatId, this.isEnabled ? 1 : 0, this.createdAt, this.updatedAt]
        );
        this.id = result.id || result.lastID;
      }

      return this;
    } catch (error) {
      console.error('Ошибка сохранения настроек Telegram:', error);
      throw error;
    }
  }
}

module.exports = TelegramSettings;








