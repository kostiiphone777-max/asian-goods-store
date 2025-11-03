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
        PORT: 3001
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

