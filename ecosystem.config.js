module.exports = {
  apps: [
    {
      name: "jump-app-challenge",
      script: "./app.js",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "local"
      },
      env_live: {
        NODE_ENV: "live"
      }
    }
  ]
};
