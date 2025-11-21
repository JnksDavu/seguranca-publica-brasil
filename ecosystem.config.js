require('dotenv').config();

module.exports = {
  apps: [
    // =======================================
    // N8N
    // =======================================
    {
      name: "n8n",
      script: "n8n",
      cwd: "n8n",
      env: {
        N8N_SECURE_COOKIE: process.env.N8N_SECURE_COOKIE,
        N8N_BASIC_AUTH_ACTIVE: process.env.N8N_BASIC_AUTH_ACTIVE,
        N8N_BASIC_AUTH_USER: process.env.N8N_BASIC_AUTH_USER,
        N8N_BASIC_AUTH_PASSWORD: process.env.N8N_BASIC_AUTH_PASSWORD,
        EXECUTIONS_DATA_SAVE_ON_SUCCESS: process.env.EXECUTIONS_DATA_SAVE_ON_SUCCESS,
        EXECUTIONS_DATA_SAVE_ON_ERROR: process.env.EXECUTIONS_DATA_SAVE_ON_ERROR,
        EXECUTIONS_DATA_PRUNE: process.env.EXECUTIONS_DATA_PRUNE,
        EXECUTIONS_DATA_MAX_AGE: process.env.EXECUTIONS_DATA_MAX_AGE
      }
    },

    // =======================================
    // BACKEND
    // =======================================
    {
      name: "server",
      script: "src/index.js",
      cwd: "server",
      env: {
        NODE_ENV: "production",
        JWT_SECRET: process.env.JWT_SECRET,
        USER_DB: process.env.USER_DB,
        PASSWORD_DB: process.env.PASSWORD_DB,
        HOST_DB: process.env.HOST_DB,
        PORT_DB: process.env.PORT_DB,
        DB: process.env.DB,
        token_fipe: process.env.token_fipe
      }
    },

    // =======================================
    // FRONTEND (servindo a pasta dist)
    // =======================================
    {
      name: "client",
      script: "/home/ubuntu/.nvm/versions/node/v20.19.4/lib/node_modules/pm2/lib/API/Serve.js",
      args: "build 4173 --spa",
      cwd: "/home/tcc/seguranca-publica-brasil/client",
      env: {
        NODE_ENV: "production"
      }
    }
    
  ]
}
