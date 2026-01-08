const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  getNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
} = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth.middleware');
const { adminOnly } = require('../middleware/role.middleware');

router.use(protect);

router.post('/', adminOnly, createNotification);
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.get('/:id', getNotification);
router.put('/:id/read', markAsRead);
router.put('/mark-all-read', markAllAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteAllNotifications);

module.exports = router;