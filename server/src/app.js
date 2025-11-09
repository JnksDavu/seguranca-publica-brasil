const express = require('express');
const cors = require('cors');
const rodoviasRoutes = require('./routes/rodovias');
const dimensoesRoutes = require('./routes/dimensoes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rodovias', rodoviasRoutes);
app.use('/api/dimensoes', dimensoesRoutes);

module.exports = app;