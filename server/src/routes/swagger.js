const express = require('express');
const router = express.Router();
const { swaggerUi, swaggerSpec } = require('../swagger/swagger');

router.get('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

router.get('/json', (req, res) => {
  res.json(swaggerSpec);
});

router.get('/../docs.json', (req, res) => {
  res.json(swaggerSpec);
});

module.exports = router;