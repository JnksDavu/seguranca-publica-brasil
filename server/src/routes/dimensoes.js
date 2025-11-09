const express = require('express');
const router = express.Router();
const dimensoesController = require('../controllers/dimensoesController');

router.get('/calendario', dimensoesController.getCalendario);
router.get('/localidade', dimensoesController.getLocalidade);
router.get('/tipoAcidente', dimensoesController.getTipoAcidente);

module.exports = router;