module.exports = {
  apps: [
    {
      name: 'naisft-api',
      cwd: '/var/www/naisft/NAISFT-INDIA/server',
      script: 'index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
      max_memory_restart: '512M',
      error_file: '/var/log/naisft-api.err.log',
      out_file: '/var/log/naisft-api.out.log',
      time: true,
    },
  ],
};

