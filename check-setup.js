#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Устанавливаем кодировку UTF-8 для Windows
if (process.platform === 'win32') {
  try {
    execSync('chcp 65001', { stdio: 'ignore' });
  } catch (error) {
    // Игнорируем ошибки установки кодировки
  }
}

console.log('🔍 Проверка настройки Asian Goods Store...\n');

// Проверяем наличие Node.js
try {
  const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
  console.log(`✅ Node.js: ${nodeVersion}`);
} catch (error) {
  console.log('❌ Node.js не найден. Установите Node.js с https://nodejs.org/');
  process.exit(1);
}

// Проверяем наличие npm
try {
  const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log(`✅ npm: ${npmVersion}`);
} catch (error) {
  console.log('❌ npm не найден');
  process.exit(1);
}

// Проверяем структуру проекта
const requiredDirs = ['backend', 'components', 'app', 'lib', 'hooks'];
const requiredFiles = [
  'backend/package.json',
  'backend/server.js',
  'package.json',
  'app/page.tsx'
];

console.log('\n📁 Проверка структуры проекта...');

requiredDirs.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`✅ Директория ${dir}/ существует`);
  } else {
    console.log(`❌ Директория ${dir}/ не найдена`);
  }
});

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ Файл ${file} существует`);
  } else {
    console.log(`❌ Файл ${file} не найден`);
  }
});

// Проверяем package.json файлы
console.log('\n📦 Проверка package.json...');

try {
  const frontendPackage = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  console.log(`✅ Frontend package.json: ${frontendPackage.name} v${frontendPackage.version}`);
} catch (error) {
  console.log('❌ Ошибка чтения frontend package.json');
}

try {
  const backendPackage = JSON.parse(fs.readFileSync('backend/package.json', 'utf8'));
  console.log(`✅ Backend package.json: ${backendPackage.name} v${backendPackage.version}`);
} catch (error) {
  console.log('❌ Ошибка чтения backend package.json');
}

// Проверяем порты
console.log('\n🌐 Проверка портов...');

function checkPort(port) {
  try {
    execSync(`netstat -an | findstr :${port}`, { encoding: 'utf8' });
    return true;
  } catch (error) {
    return false;
  }
}

const port3000 = checkPort(3000);
const port3001 = checkPort(3001);

if (port3000) {
  console.log('⚠️  Порт 3000 занят (возможно, уже запущен frontend)');
} else {
  console.log('✅ Порт 3000 свободен');
}

if (port3001) {
  console.log('⚠️  Порт 3001 занят (возможно, уже запущен backend)');
} else {
  console.log('✅ Порт 3001 свободен');
}

console.log('\n🚀 Готово к запуску!');
console.log('\nДля запуска используйте:');
console.log('  Windows: start-dev.bat');
console.log('  Linux/Mac: ./start-dev.sh');
console.log('\nИли запустите вручную:');
console.log('  1. cd backend && npm install && npm run init-db && npm run dev');
console.log('  2. cd .. && npm install && npm run dev');
console.log('\nПосле запуска:');
console.log('  Frontend: http://localhost:3000');
console.log('  Backend: http://localhost:3001');
console.log('  Health Check: http://localhost:3001/api/health');
