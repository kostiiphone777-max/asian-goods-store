const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/database');

const { JWT_SECRET } = require('../config/jwt');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.email = data.email;
    this.password = data.password;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.role = data.role || 'user';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Создание пользователя
  static async create(userData) {
    try {
      // Проверяем, существует ли пользователь с таким email
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ?',
        [userData.email]
      );

      if (existingUser) {
        throw new Error('Пользователь с таким email уже существует');
      }

      // Хешируем пароль
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const user = new User({
        ...userData,
        password: hashedPassword
      });

      await db.run(
        `INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [user.id, user.email, user.password, user.firstName, user.lastName, user.role, user.createdAt, user.updatedAt]
      );

      // Возвращаем пользователя без пароля
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw error;
    }
  }

  // Поиск пользователя по email
  static async findByEmail(email) {
    try {
      const user = await db.get(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Поиск пользователя по ID
  static async findById(id) {
    try {
      const user = await db.get(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return user;
    } catch (error) {
      throw error;
    }
  }

  // Проверка пароля
  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      throw error;
    }
  }

  // Генерация JWT токена
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  // Верификация JWT токена
  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Недействительный токен');
    }
  }

  // Обновление пользователя
  static async update(id, updateData) {
    try {
      const fields = [];
      const values = [];

      if (updateData.firstName) {
        fields.push('firstName = ?');
        values.push(updateData.firstName);
      }
      if (updateData.lastName) {
        fields.push('lastName = ?');
        values.push(updateData.lastName);
      }
      if (updateData.email) {
        fields.push('email = ?');
        values.push(updateData.email);
      }
      if (updateData.role) {
        fields.push('role = ?');
        values.push(updateData.role);
      }

      if (fields.length === 0) {
        throw new Error('Нет данных для обновления');
      }

      fields.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.run(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        values
      );

      return await User.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Удаление пользователя
  static async delete(id) {
    try {
      await db.run('DELETE FROM users WHERE id = ?', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Получение всех пользователей (для админа)
  static async getAll(limit = 50, offset = 0) {
    try {
      const users = await db.all(
        'SELECT id, email, firstName, lastName, role, createdAt, updatedAt FROM users ORDER BY createdAt DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
      return users;
    } catch (error) {
      throw error;
    }
  }

  // Сохранение пользователя (для миграции)
  async save() {
    try {
      // Проверяем, существует ли пользователь
      const existingUser = await db.get(
        'SELECT id FROM users WHERE email = ?',
        [this.email]
      );

      if (existingUser) {
        // Обновляем существующего пользователя
        await db.run(
          `UPDATE users SET password = ?, firstName = ?, lastName = ?, role = ?, updatedAt = ? WHERE email = ?`,
          [this.password, this.firstName, this.lastName, this.role, this.updatedAt, this.email]
        );
      } else {
        // Создаем нового пользователя
        await db.run(
          `INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [this.id, this.email, this.password, this.firstName, this.lastName, this.role, this.createdAt, this.updatedAt]
        );
      }
      return this;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;