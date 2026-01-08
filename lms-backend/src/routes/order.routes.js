const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders } = require('../controllers/order.controller');
const { protect } = require('../middleware/auth.middleware');
const { paymentLimiter } = require('../middleware/rateLimit.middleware');

router.use(protect);

router.post('/', paymentLimiter, createOrder);
router.get('/my-orders', getMyOrders);

module.exports = router;