module.exports = {
  apps: [
    {
      name: "api-gateway",
      script: "./apps/api-gateway/dist/main.js",
      autorestart: true,
      watch: false,
      env: {
        HOSTNAME: "0.0.0.0",
        PORT: 8080
      }
    },
    {
      name: "auth-backend",
      script: "./apps/auth-service/dist/apps/auth-service/src/main.js",
      interpreter: "node",
      autorestart: true,
      watch: false,
      env: {
        ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001,http://192.168.43.79:3000,http://192.168.43.79:3001,http://192.168.43.167:3000,http://192.168.43.167:3001,http://192.168.56.1:3000,http://192.168.56.1:3001,http://192.168.100.79:3000,http://192.168.100.79:3001"
      }
    },
    {
      name: "product-service",
      script: "./apps/product-service/dist/main.js",
      interpreter: "node",
      autorestart: true,
      watch: false,
      env: {
        PORT: 6002
      }
    },
    {
      name: "admin-service",
      script: "./apps/admin-service/dist/main.js",
      interpreter: "node",
      autorestart: true,
      watch: false,
      env: {
        PORT: 6004,
        ALLOWED_ORIGINS: "http://localhost:3000,http://localhost:3001,http://localhost:3002,http://192.168.100.79:3000,http://192.168.100.79:3001,http://192.168.100.79:3002"
      }
    },
    {
      name: "admin-ui",
      cwd: "./apps/admin-ui",
      script: "../../node_modules/next/dist/bin/next",
      args: "dev",
      autorestart: true,
      watch: false,
      env: {
        HOSTNAME: "0.0.0.0",
        PORT: 3002
      }
    },
    {
      name: "user-ui",
      cwd: "./apps/user-ui",
      script: "../../node_modules/next/dist/bin/next",
      args: "dev",
      autorestart: true,
      watch: false,
      env: {
        HOSTNAME: "0.0.0.0" , // <-- Add this line here
        PORT: 3000
      }
    },
    {
      name: "seller-ui",
      cwd: "./apps/seller-ui",
      script: "../../node_modules/next/dist/bin/next",
      args: "dev",
      autorestart: true,
      watch: false,
      env: {
        HOSTNAME: "0.0.0.0",  // <-- Add this line here too
        PORT: 3001
      }
    }
  ]
};

