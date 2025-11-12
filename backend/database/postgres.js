const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

class PostgresDatabase {
  constructor() {
    this.pool = null;
  }

  async init() {
    // Поддержка URL либо отдельных переменных окружения
    const connectionString =
      process.env.POSTGRES_URL ||
      process.env.DATABASE_URL ||
      undefined;

    // Если есть connection string, используем его
    if (connectionString) {
      this.pool = new Pool({ connectionString });
    } else {
      // Используем отдельные переменные, проверяя тип пароля
      const password = process.env.PGPASSWORD;
      if (password !== undefined && typeof password !== 'string') {
        throw new Error(`PGPASSWORD must be a string, got ${typeof password}. Check your .env file.`);
      }

      this.pool = new Pool({
        host: process.env.PGHOST || 'localhost',
        port: Number(process.env.PGPORT || 5432),
        database: process.env.PGDATABASE || 'postgres',
        user: process.env.PGUSER || 'postgres',
        password: password || '',
      });
    }

    // Проверяем подключение
    await this.pool.query('SELECT 1');
    console.log('✅ Подключение к PostgreSQL установлено');

    // Применяем схему (если нужно)
    const schemaPath = path.join(__dirname, 'schema.postgres.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await this.pool.query(schema);
      console.log('✅ Таблицы PostgreSQL созданы/обновлены');
    }
  }

  // Конвертер плейсхолдеров "?" -> $1, $2 ... и нормализация SQL для PostgreSQL
  toPg(sql, params) {
    // Нормализуем SQL запросы для совместимости с PostgreSQL
    // (обратная совместимость со старым кодом, который мог использовать SQLite-подобный синтаксис)
    let normalized = sql
      // булевы значения: 0/1 → true/false
      .replace(/\bisActive\s*=\s*1\b/gi, 'isActive = true')
      .replace(/\bisActive\s*=\s*0\b/gi, 'isActive = false')
      // строковые литералы: двойные кавычки → одинарные
      .replace(/status\s*!=\s*"cancelled"/gi, "status != 'cancelled'")
      .replace(/status\s*=\s*"([^"]+)"/gi, "status = '$1'");

    let i = 0;
    const mapped = normalized.replace(/\?/g, () => {
      i += 1;
      return `$${i}`;
    });
    return { text: mapped, values: params };
  }

  async run(sql, params = []) {
    const { text, values } = this.toPg(sql, params);
    const res = await this.pool.query(text, values);
    return { rowCount: res.rowCount };
  }

  async get(sql, params = []) {
    const { text, values } = this.toPg(sql, params);
    const res = await this.pool.query(text, values);
    return res.rows[0] || null;
  }

  async all(sql, params = []) {
    const { text, values } = this.toPg(sql, params);
    const res = await this.pool.query(text, values);
    return res.rows;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✅ Соединение с PostgreSQL закрыто');
    }
  }
}

module.exports = new PostgresDatabase();


