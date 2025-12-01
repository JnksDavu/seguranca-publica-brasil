const express = require('express');
const cors = require('cors');

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const rodoviasRoutes = require('./routes/rodovias');
const dimensoesRoutes = require('./routes/dimensoes');
const ocorrenciasRoutes = require('./routes/ocorrencias');
const swaggerRoutes = require('./routes/swagger');
const presidiosRoutes = require('./routes/presidios');

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://seguranca-publica-brasil.com",
    "https://www.seguranca-publica-brasil.com"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Rotas públicas (Swagger e auth)
app.use('/api/docs', swaggerRoutes);
app.use('/api/auth', authRoutes);

// Rotas protegidas (após middleware)
app.use(authMiddleware);
app.use('/api/rodovias', rodoviasRoutes);
app.use('/api/dimensoes', dimensoesRoutes);
app.use('/api/ocorrencias', ocorrenciasRoutes);
app.use('/api/presidios', presidiosRoutes);

module.exports = app;