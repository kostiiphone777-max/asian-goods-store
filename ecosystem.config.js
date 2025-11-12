module.exports = {
  apps: [
    {
      name: 'asian-goods-backend',
      script: './backend/server.js',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        POSTGRES_URL: 'postgres://magazin_user:27061406@localhost:5432/magazin',
        PGHOST: 'localhost',
        PGPORT: '5432',
        PGDATABASE: 'magazin',
        PGUSER: 'magazin_user',
        PGPASSWORD: '27061406',
        FRONTEND_URL: 'https://45.141.78.168',
        JWT_SECRET: 'cf27ac8560bcc7127456d5c8c33a6f0433f5d6263e1af098a7aa6a2cb422f49b'
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'asian-goods-frontend',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: './',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true,
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],

  deploy: {
    production: {
      user: 'root',
      host: '45.141.78.168',
      ref: 'origin/main',
      repo: 'git@github.com:your-repo/asian-goods-store.git', // Замените на ваш репозиторий
      path: '/opt/asian-goods-store',
      'post-deploy': 'npm install && cd backend && npm install && cd .. && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'mkdir -p /opt/asian-goods-store'
    }
  }
};

