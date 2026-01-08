

const express = require('express');
const router = express.Router();
const { handleWebhook, verifyPayment } = require('../controllers/payment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/webhook', handleWebhook);

router.get('/verify/:orderId', protect, verifyPayment);

module.exports = router;