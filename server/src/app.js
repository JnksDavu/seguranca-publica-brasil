const express = require('express');
const cors = require('cors');

const authMiddleware = require('./middlewares/auth');
const authRoutes = require('./routes/auth');
const rodoviasRoutes = require('./routes/rodovias');
const dimensoesRoutes = require('./routes/dimensoes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.use(authMiddleware);

app.use('/api/rodovias', rodoviasRoutes);
app.use('/api/dimensoes', dimensoesRoutes);

module.exports = app;