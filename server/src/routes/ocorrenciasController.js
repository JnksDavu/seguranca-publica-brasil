const express = require('express');
const router = express.Router();
const ocorrenciasController = require('../controllers/ocorrenciasController');

router.get('/indicadores', ocorrenciasController.getIndicadores);

router.get('/', ocorrenciasController.getOcorrencias);

router.post('/export', ocorrenciasController.exportOcorrencias);

router.get('/export', ocorrenciasController.exportOcorrencias);

router.get('/:id', ocorrenciasController.getOcorrenciaById);

module.exports = router;