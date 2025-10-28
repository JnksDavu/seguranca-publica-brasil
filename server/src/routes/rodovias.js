const express = require('express');
const router = express.Router();
const rodoviasController = require('../controllers/rodoviasController');

router.get('/', rodoviasController.getRodovias);

router.get('/:id', rodoviasController.getRodoviaById);

module.exports = router;