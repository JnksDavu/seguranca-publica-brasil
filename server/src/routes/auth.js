const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/test', authController.getTokenTest);
router.get('/system-token', authController.getSystemToken);

module.exports = router;
