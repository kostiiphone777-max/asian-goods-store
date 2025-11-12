/**
 * Одноразовая миграция данных из SQLite в PostgreSQL
 * 
 * ВНИМАНИЕ: Этот скрипт используется только для переноса данных из старой SQLite базы.
 * После миграции проект полностью переходит на PostgreSQL.
 * 
 * Требования:
 * - Старая SQLite база должна существовать: backend/database/store.db
 * - PostgreSQL должен быть установлен и запущен
 * - Переменные окружения PG* или POSTGRES_URL должны быть настроены
 *
 * Запуск:
 *   npm run migrate:sqlite:pg
 *   или
 *   node backend/scripts/migrate-sqlite-to-postgres.js
 */
const path = require('path');
// Загружаем .env (корневой и backend), чтобы PG* переменные были доступны при запуске скрипта напрямую
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });
} catch (_) {}
try {
  require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
} catch (_) {}
const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const fs = require('fs');

async function readAll(sqlite, sql, params = []) {
  return new Promise((resolve, reject) => {
    sqlite.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function runPg(pool, text, values) {
  await pool.query(text, values);
}

async function main() {
  const dbPath = path.join(__dirname, '..', 'database', 'store.db');
  if (!fs.existsSync(dbPath)) {
    console.error('❌ SQLite база не найдена:', dbPath);
    process.exit(1);
  }

  console.log('🔗 Открываем SQLite:', dbPath);
  const sqlite = new sqlite3.Database(dbPath);

  const connectionString =
    process.env.POSTGRES_URL || process.env.DATABASE_URL || undefined;

  const pool = new Pool(
    connectionString
      ? { connectionString }
      : {
          host: process.env.PGHOST || 'localhost',
          port: Number(process.env.PGPORT || 5432),
          database: process.env.PGDATABASE || 'postgres',
          user: process.env.PGUSER || 'postgres',
          password: process.env.PGPASSWORD || '',
        }
  );
  await pool.query('SELECT 1');
  console.log('✅ Подключились к PostgreSQL');

  // Создаем схему в PG
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.postgres.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  console.log('✅ Схема в PostgreSQL готова');

  // Читаем данные из SQLite
  const users = await readAll(sqlite, 'SELECT * FROM users');
  const categories = await readAll(sqlite, 'SELECT * FROM categories');
  const products = await readAll(sqlite, 'SELECT * FROM products');
  const orders = await readAll(sqlite, 'SELECT * FROM orders');
  const orderItems = await readAll(sqlite, 'SELECT * FROM order_items');
  const cartItems = await readAll(sqlite, 'SELECT * FROM cart_items');
  const telegram = await readAll(sqlite, 'SELECT * FROM telegram_settings');

  console.log('📦 Импортируем данные в PostgreSQL...');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Вставки с upsert
    for (const u of users) {
      await runPg(
        client,
        `INSERT INTO users (id, email, password, firstName, lastName, role, createdAt, updatedAt)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (id) DO UPDATE SET
           email=EXCLUDED.email, password=EXCLUDED.password, firstName=EXCLUDED.firstName,
           lastName=EXCLUDED.lastName, role=EXCLUDED.role, updatedAt=EXCLUDED.updatedAt`,
        [u.id, u.email, u.password, u.firstName, u.lastName, u.role, u.createdAt, u.updatedAt]
      );
    }

    for (const c of categories) {
      await runPg(
        client,
        `INSERT INTO categories (id, name, description, slug, image, parentId, isActive, sortOrder, metaTitle, metaDescription, createdAt, updatedAt)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, description=EXCLUDED.description, slug=EXCLUDED.slug, image=EXCLUDED.image,
           parentId=EXCLUDED.parentId, isActive=EXCLUDED.isActive, sortOrder=EXCLUDED.sortOrder,
           metaTitle=EXCLUDED.metaTitle, metaDescription=EXCLUDED.metaDescription, updatedAt=EXCLUDED.updatedAt`,
        [
          c.id, c.name, c.description, c.slug, c.image, c.parentId,
          c.isActive ? true : false, c.sortOrder, c.metaTitle, c.metaDescription,
          c.createdAt, c.updatedAt
        ]
      );
    }

    for (const p of products) {
      await runPg(
        client,
        `INSERT INTO products
          (id, name, description, price, originalPrice, categoryId, slug, images, badge, stock, isActive, tags, rating, reviewCount, weight, dimensions, country, createdAt, updatedAt)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET
           name=EXCLUDED.name, description=EXCLUDED.description, price=EXCLUDED.price,
           originalPrice=EXCLUDED.originalPrice, categoryId=EXCLUDED.categoryId, slug=EXCLUDED.slug,
           images=EXCLUDED.images, badge=EXCLUDED.badge, stock=EXCLUDED.stock, isActive=EXCLUDED.isActive,
           tags=EXCLUDED.tags, rating=EXCLUDED.rating, reviewCount=EXCLUDED.reviewCount,
           weight=EXCLUDED.weight, dimensions=EXCLUDED.dimensions, country=EXCLUDED.country,
           updatedAt=EXCLUDED.updatedAt`,
        [
          p.id, p.name, p.description, p.price, p.originalPrice, p.categoryId, p.slug,
          p.images, p.badge, p.stock, p.isActive ? true : false, p.tags, p.rating, p.reviewCount,
          p.weight, p.dimensions, p.country, p.createdAt, p.updatedAt
        ]
      );
    }

    for (const o of orders) {
      await runPg(
        client,
        `INSERT INTO orders
          (id, userId, orderNumber, status, items, subtotal, shippingCost, tax, total, shippingAddress, billingAddress,
           paymentMethod, paymentStatus, notes, trackingNumber, shippedAt, deliveredAt, createdAt, updatedAt)
         VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT (id) DO UPDATE SET
           userId=EXCLUDED.userId, orderNumber=EXCLUDED.orderNumber, status=EXCLUDED.status,
           items=EXCLUDED.items, subtotal=EXCLUDED.subtotal, shippingCost=EXCLUDED.shippingCost, tax=EXCLUDED.tax,
           total=EXCLUDED.total, shippingAddress=EXCLUDED.shippingAddress, billingAddress=EXCLUDED.billingAddress,
           paymentMethod=EXCLUDED.paymentMethod, paymentStatus=EXCLUDED.paymentStatus, notes=EXCLUDED.notes,
           trackingNumber=EXCLUDED.trackingNumber, shippedAt=EXCLUDED.shippedAt, deliveredAt=EXCLUDED.deliveredAt,
           updatedAt=EXCLUDED.updatedAt`,
        [
          o.id, o.userId, o.orderNumber, o.status, o.items, o.subtotal, o.shippingCost, o.tax, o.total,
          o.shippingAddress, o.billingAddress, o.paymentMethod, o.paymentStatus, o.notes, o.trackingNumber,
          o.shippedAt, o.deliveredAt, o.createdAt, o.updatedAt
        ]
      );
    }

    for (const oi of orderItems) {
      await runPg(
        client,
        `INSERT INTO order_items (id, orderId, productId, quantity, price, createdAt)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           orderId=EXCLUDED.orderId, productId=EXCLUDED.productId, quantity=EXCLUDED.quantity,
           price=EXCLUDED.price, createdAt=EXCLUDED.createdAt`,
        [oi.id, oi.orderId, oi.productId, oi.quantity, oi.price, oi.createdAt]
      );
    }

    for (const ci of cartItems) {
      await runPg(
        client,
        `INSERT INTO cart_items (id, userId, sessionId, items, createdAt, updatedAt)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           userId=EXCLUDED.userId, sessionId=EXCLUDED.sessionId, items=EXCLUDED.items, updatedAt=EXCLUDED.updatedAt`,
        [ci.id, ci.userId, ci.sessionId, ci.items, ci.createdAt, ci.updatedAt]
      );
    }

    for (const t of telegram) {
      await runPg(
        client,
        `INSERT INTO telegram_settings (id, botToken, chatId, isEnabled, createdAt, updatedAt)
         VALUES ($1,$2,$3,$4,$5,$6)
         ON CONFLICT (id) DO UPDATE SET
           botToken=EXCLUDED.botToken, chatId=EXCLUDED.chatId, isEnabled=EXCLUDED.isEnabled, updatedAt=EXCLUDED.updatedAt`,
        [t.id, t.botToken, t.chatId, !!t.isEnabled, t.createdAt, t.updatedAt]
      );
    }

    await client.query('COMMIT');
    console.log('✅ Данные успешно перенесены в PostgreSQL');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('❌ Ошибка миграции:', e);
    process.exit(1);
  } finally {
    client.release();
    sqlite.close();
    await pool.end();
  }
}

main();


