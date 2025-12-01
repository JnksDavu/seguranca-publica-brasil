const express = require('express');
const router = express.Router();
const presidiosController = require('../controllers/presidiosController');

router.get('/', presidiosController.getPresidios);
router.post('/export', presidiosController.exportPresidios);
router.get('/export', presidiosController.exportPresidios);

module.exports = router;