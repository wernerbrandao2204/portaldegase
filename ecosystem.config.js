export default {
  apps: [
    {
      name: 'degase-portal',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/degase-portal/error.log',
      out_file: '/var/log/degase-portal/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      ignore_watch: ['node_modules', 'dist/public'],
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
