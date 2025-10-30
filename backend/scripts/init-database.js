const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Создаем директории для данных
const dataDir = path.join(__dirname, '../data');
const uploadsDir = path.join(__dirname, '../uploads');

async function createDirectories() {
  try {
    await fs.mkdir(dataDir, { recursive: true });
    await fs.mkdir(uploadsDir, { recursive: true });
    console.log('✅ Директории созданы');
  } catch (error) {
    console.error('❌ Ошибка создания директорий:', error.message);
  }
}

// Инициализация категорий
async function initCategories() {
  const categories = [
    {
      id: uuidv4(),
      name: 'Продукты',
      slug: 'products',
      description: 'Азиатские продукты питания: соусы, специи, лапша, рис',
      image: '/asian-food-products-soy-sauce-noodles.jpg',
      sortOrder: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Косметика',
      slug: 'cosmetics',
      description: 'K-beauty и J-beauty косметика: маски, кремы, сыворотки',
      image: '/korean-japanese-beauty-skincare-products.jpg',
      sortOrder: 2,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Посуда',
      slug: 'tableware',
      description: 'Традиционная азиатская посуда: чайные наборы, палочки, миски',
      image: '/asian-tea-set-ceramic-bowls.jpg',
      sortOrder: 3,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Декор',
      slug: 'decor',
      description: 'Азиатский декор для дома: статуэтки, веера, фонари',
      image: '/asian-home-decor-lanterns-fans.jpg',
      sortOrder: 4,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await fs.writeFile(
    path.join(dataDir, 'categories.json'),
    JSON.stringify(categories, null, 2)
  );
  console.log('✅ Категории инициализированы');
  return categories;
}

// Инициализация товаров
async function initProducts(categories) {
  const products = [
    // Продукты
    {
      id: uuidv4(),
      name: 'Соевый соус премиум',
      description: 'Натуральный соевый соус из Японии, выдержанный 2 года',
      price: 890,
      originalPrice: 1200,
      categoryId: categories[0].id,
      slug: 'soy-sauce-premium',
      images: ['/premium-japanese-soy-sauce-bottle.jpg'],
      badge: 'Хит продаж',
      stock: 50,
      isActive: true,
      tags: ['соус', 'япония', 'премиум'],
      rating: 4.8,
      reviewCount: 24,
      weight: '500ml',
      country: 'Япония',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Рисовая лапша',
      description: 'Традиционная вьетнамская лапша из рисовой муки',
      price: 280,
      categoryId: categories[0].id,
      slug: 'rice-noodles',
      images: ['/vietnamese-rice-noodles-package.jpg'],
      badge: null,
      stock: 100,
      isActive: true,
      tags: ['лапша', 'вьетнам', 'рисовая'],
      rating: 4.5,
      reviewCount: 18,
      weight: '200g',
      country: 'Вьетнам',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Кимчи паста',
      description: 'Острая корейская паста для приготовления кимчи',
      price: 450,
      categoryId: categories[0].id,
      slug: 'kimchi-paste',
      images: ['/korean-kimchi-paste-jar.jpg'],
      badge: 'Новинка',
      stock: 30,
      isActive: true,
      tags: ['кимчи', 'корея', 'острое'],
      rating: 4.6,
      reviewCount: 12,
      weight: '300g',
      country: 'Корея',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Васаби порошок',
      description: 'Японский васаби в порошке для приготовления острого соуса',
      price: 320,
      categoryId: categories[0].id,
      slug: 'wasabi-powder',
      images: ['/japanese-wasabi-powder.jpg'],
      badge: null,
      stock: 75,
      isActive: true,
      tags: ['васаби', 'япония', 'острый'],
      rating: 4.3,
      reviewCount: 8,
      weight: '50g',
      country: 'Япония',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Косметика
    {
      id: uuidv4(),
      name: 'Корейская тканевая маска',
      description: 'Увлажняющая маска с гиалуроновой кислотой',
      price: 350,
      categoryId: categories[1].id,
      slug: 'korean-sheet-mask',
      images: ['/korean-sheet-face-mask.jpg'],
      badge: 'Популярное',
      stock: 80,
      isActive: true,
      tags: ['маска', 'корея', 'увлажнение'],
      rating: 4.7,
      reviewCount: 35,
      weight: '25ml',
      country: 'Корея',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Корейский солнцезащитный крем',
      description: 'SPF 50+ солнцезащитный крем с увлажняющим эффектом',
      price: 1200,
      categoryId: categories[1].id,
      slug: 'korean-sunscreen',
      images: ['/korean-sunscreen-spf50.jpg'],
      badge: 'Рекомендуем',
      stock: 40,
      isActive: true,
      tags: ['солнцезащитный', 'корея', 'spf50'],
      rating: 4.9,
      reviewCount: 42,
      weight: '60ml',
      country: 'Корея',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Витамин C сыворотка',
      description: 'Осветляющая сыворотка с витамином C для сияющей кожи',
      price: 1800,
      categoryId: categories[1].id,
      slug: 'vitamin-c-serum',
      images: ['/vitamin-c-serum.png'],
      badge: 'Эксклюзив',
      stock: 25,
      isActive: true,
      tags: ['сыворотка', 'витамин c', 'осветление'],
      rating: 4.8,
      reviewCount: 28,
      weight: '30ml',
      country: 'Корея',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Посуда
    {
      id: uuidv4(),
      name: 'Набор для чайной церемонии',
      description: 'Традиционный керамический набор из Японии',
      price: 4500,
      originalPrice: 6000,
      categoryId: categories[2].id,
      slug: 'tea-ceremony-set',
      images: ['/japanese-tea-ceremony-set-ceramic.jpg'],
      badge: 'Хит продаж',
      stock: 15,
      isActive: true,
      tags: ['чай', 'япония', 'керамика'],
      rating: 4.9,
      reviewCount: 16,
      weight: '2.5kg',
      country: 'Япония',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Бамбуковые палочки',
      description: 'Набор бамбуковых палочек для еды в подарочной упаковке',
      price: 180,
      categoryId: categories[2].id,
      slug: 'bamboo-chopsticks',
      images: ['/bamboo-chopsticks-set.jpg'],
      badge: null,
      stock: 200,
      isActive: true,
      tags: ['палочки', 'бамбук', 'подарок'],
      rating: 4.4,
      reviewCount: 31,
      weight: '50g',
      country: 'Китай',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Керамические миски для риса',
      description: 'Набор из 4 керамических мисок для риса',
      price: 1200,
      categoryId: categories[2].id,
      slug: 'ceramic-rice-bowls',
      images: ['/ceramic-rice-bowls.jpg'],
      badge: null,
      stock: 60,
      isActive: true,
      tags: ['миски', 'керамика', 'рис'],
      rating: 4.6,
      reviewCount: 22,
      weight: '1.2kg',
      country: 'Япония',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },

    // Декор
    {
      id: uuidv4(),
      name: 'Бамбуковое растение',
      description: 'Счастливый бамбук в декоративной вазе',
      price: 1200,
      categoryId: categories[3].id,
      slug: 'lucky-bamboo',
      images: ['/lucky-bamboo-plant-vase.jpg'],
      badge: null,
      stock: 35,
      isActive: true,
      tags: ['бамбук', 'декор', 'счастье'],
      rating: 4.5,
      reviewCount: 19,
      weight: '800g',
      country: 'Китай',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Декоративный веер',
      description: 'Настенный веер с традиционной росписью',
      price: 1800,
      categoryId: categories[3].id,
      slug: 'decorative-fan',
      images: ['/decorative-wall-fan-asian.jpg'],
      badge: 'Эксклюзив',
      stock: 20,
      isActive: true,
      tags: ['веер', 'декор', 'роспись'],
      rating: 4.7,
      reviewCount: 14,
      weight: '300g',
      country: 'Китай',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: 'Керамическая статуэтка Будды',
      description: 'Декоративная статуэтка Будды из керамики',
      price: 2500,
      categoryId: categories[3].id,
      slug: 'buddha-statue',
      images: ['/ceramic-buddha-statue.jpg'],
      badge: 'Рекомендуем',
      stock: 12,
      isActive: true,
      tags: ['будда', 'статуэтка', 'керамика'],
      rating: 4.8,
      reviewCount: 8,
      weight: '1.5kg',
      country: 'Таиланд',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await fs.writeFile(
    path.join(dataDir, 'products.json'),
    JSON.stringify(products, null, 2)
  );
  console.log('✅ Товары инициализированы');
}

// Инициализация пользователей
async function initUsers() {
  const users = [
    {
      id: uuidv4(),
      email: 'admin@asiangoods.ru',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a', // password: admin123
      firstName: 'Администратор',
      lastName: 'Системы',
      phone: '+7 (999) 123-45-67',
      role: 'admin',
      isActive: true,
      emailVerified: true,
      addresses: [
        {
          id: uuidv4(),
          street: 'ул. Примерная, д. 1',
          city: 'Москва',
          postalCode: '123456',
          country: 'Россия',
          isDefault: true
        }
      ],
      preferences: {
        newsletter: true,
        notifications: true,
        language: 'ru'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      email: 'customer@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2a', // password: admin123
      firstName: 'Иван',
      lastName: 'Петров',
      phone: '+7 (999) 765-43-21',
      role: 'customer',
      isActive: true,
      emailVerified: true,
      addresses: [],
      preferences: {
        newsletter: true,
        notifications: false,
        language: 'ru'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  await fs.writeFile(
    path.join(dataDir, 'users.json'),
    JSON.stringify(users, null, 2)
  );
  console.log('✅ Пользователи инициализированы');
}

// Инициализация пустых файлов
async function initEmptyFiles() {
  const emptyFiles = ['orders.json', 'carts.json'];
  
  for (const file of emptyFiles) {
    await fs.writeFile(
      path.join(dataDir, file),
      JSON.stringify([], null, 2)
    );
  }
  
  console.log('✅ Пустые файлы созданы');
}

// Основная функция инициализации
async function initDatabase() {
  console.log('🚀 Начинаем инициализацию базы данных...\n');
  
  try {
    await createDirectories();
    const categories = await initCategories();
    await initProducts(categories);
    await initUsers();
    await initEmptyFiles();
    
    console.log('\n✅ База данных успешно инициализирована!');
    console.log('\n📊 Создано:');
    console.log('   - 4 категории товаров');
    console.log('   - 12 товаров');
    console.log('   - 2 пользователя (admin@asiangoods.ru / customer@example.com)');
    console.log('   - Пароль для всех пользователей: admin123');
    console.log('\n🔗 API доступно по адресу: http://localhost:3001');
    console.log('📖 Health check: http://localhost:3001/api/health');
    
  } catch (error) {
    console.error('❌ Ошибка инициализации:', error.message);
    process.exit(1);
  }
}

// Запуск инициализации
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase };


