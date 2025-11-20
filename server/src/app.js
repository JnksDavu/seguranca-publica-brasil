const express = require('express');
const cors = require('cors');

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const rodoviasRoutes = require('./routes/rodovias');
const dimensoesRoutes = require('./routes/dimensoes');

const app = express();

app.use(cors({
    origin: [
      "http://localhost:3000",
      "https://seguranca-publica-brasil.com",
      "https://www.seguranca-publica-brasil.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));
app.use(express.json());

app.use('/api/auth', authRoutes);

// Rotas da API
app.use(authMiddleware);
app.use('/api/rodovias', rodoviasRoutes);
app.use('/api/dimensoes', dimensoesRoutes);

module.exports = app;
