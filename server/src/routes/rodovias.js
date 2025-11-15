const express = require('express');
const router = express.Router();
const rodoviasController = require('../controllers/rodoviasController');

router.get('/', rodoviasController.getRodovias);

// Export endpoint (POST recommended for complex filters in body)
router.post('/export', rodoviasController.exportRodovias);
// Also allow GET /export with query params
router.get('/export', rodoviasController.exportRodovias);

router.get('/:id', rodoviasController.getRodoviaById);

module.exports = router;