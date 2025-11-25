const express = require('express');
const router = express.Router();
const rodoviasController = require('../controllers/rodoviasController');

router.get('/indicadores', rodoviasController.getIndicadores);

router.get('/', rodoviasController.getRodovias);

router.post('/export', rodoviasController.exportRodovias);

router.get('/export', rodoviasController.exportRodovias);

module.exports = router;