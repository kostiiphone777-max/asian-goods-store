#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Устанавливаем кодировку UTF-8 для Windows
if (process.platform === 'win32') {
  try {
    exec('chcp 65001', (error) => {
      if (error) console.log('Не удалось установить кодировку UTF-8');
    });
  } catch (error) {
    // Игнорируем ошибки
  }
}

console.log('🚀 Запуск Asian Goods Store - Все в одном окне');
console.log();

// Проверяем и устанавливаем зависимости
async function setupDependencies() {
  return new Promise((resolve) => {
    console.log('📦 Проверка зависимостей...');
    
    // Проверяем backend
    if (!fs.existsSync('backend/node_modules')) {
      console.log('Установка зависимостей backend...');
      const backendInstall = spawn('npm', ['install'], { 
        cwd: 'backend', 
        stdio: 'inherit',
        shell: true 
      });
      
      backendInstall.on('close', (code) => {
        if (code !== 0) {
          console.log('❌ Ошибка установки backend');
          process.exit(1);
        }
        checkFrontend();
      });
    } else {
      checkFrontend();
    }
    
    function checkFrontend() {
      if (!fs.existsSync('node_modules')) {
        console.log('Установка зависимостей frontend...');
        const frontendInstall = spawn('npm', ['install', '--legacy-peer-deps'], { 
          stdio: 'inherit',
          shell: true 
        });
        
        frontendInstall.on('close', (code) => {
          if (code !== 0) {
            console.log('❌ Ошибка установки frontend');
            process.exit(1);
          }
          checkDatabase();
        });
      } else {
        checkDatabase();
      }
    }
    
    function checkDatabase() {
      if (!fs.existsSync('backend/data/products.json')) {
        console.log('🗄️ Инициализация базы данных...');
        const initDb = spawn('npm', ['run', 'init-db'], { 
          cwd: 'backend', 
          stdio: 'inherit',
          shell: true 
        });
        
        initDb.on('close', (code) => {
          if (code !== 0) {
            console.log('❌ Ошибка инициализации БД');
            process.exit(1);
          }
          resolve();
        });
      } else {
        resolve();
      }
    }
  });
}

// Запускаем серверы
async function startServers() {
  console.log();
  console.log('🔧 Запуск серверов...');
  console.log();
  console.log('✅ Серверы запущены!');
  console.log();
  console.log('🌐 Frontend: http://localhost:3000');
  console.log('🔧 Backend:  http://localhost:3001');
  console.log('📊 Health:   http://localhost:3001/api/health');
  console.log();
  console.log('Нажмите Ctrl+C для остановки всех серверов...');
  console.log();
  
  // Запускаем backend
  const backend = spawn('npm', ['run', 'dev'], {
    cwd: 'backend',
    stdio: 'pipe',
    shell: true
  });
  
  // Запускаем frontend
  const frontend = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true
  });
  
  // Обработка вывода backend
  backend.stdout.on('data', (data) => {
    process.stdout.write(`[Backend] ${data}`);
  });
  
  backend.stderr.on('data', (data) => {
    process.stderr.write(`[Backend Error] ${data}`);
  });
  
  // Обработка завершения
  function cleanup() {
    console.log();
    console.log('🛑 Остановка серверов...');
    backend.kill();
    frontend.kill();
    process.exit(0);
  }
  
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  
  // Ожидаем завершения frontend (основной процесс)
  frontend.on('close', (code) => {
    console.log(`Frontend завершен с кодом ${code}`);
    cleanup();
  });
}

// Основная функция
async function main() {
  try {
    await setupDependencies();
    await startServers();
  } catch (error) {
    console.error('❌ Ошибка:', error.message);
    process.exit(1);
  }
}

main();


