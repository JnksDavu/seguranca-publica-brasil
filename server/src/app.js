const express = require('express');
const cors = require('cors');
const rodoviasRoutes = require('./routes/rodovias');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rodovias', rodoviasRoutes);

module.exports = app;