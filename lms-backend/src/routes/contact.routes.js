const express = require('express');
const router = express.Router();
const { 
  submitContactMessage, 
  getAllContactMessages,
  updateMessageStatus,
  archiveMessage,
  deleteMessage,
  replyToMessage
} = require('../controllers/contact.controller');

router.post('/', submitContactMessage);

router.get('/', getAllContactMessages);
router.post('/:id/reply', replyToMessage);
router.patch('/:id/status', updateMessageStatus);
router.patch('/:id/archive', archiveMessage);
router.delete('/:id', deleteMessage);

module.exports = router;