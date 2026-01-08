const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  logout,
  changePasswordController,
  updateProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const { uploadSingle, handleUploadError } = require('../middleware/upload.middleware');


router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword); 


router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePasswordController);
router.put('/update-profile', protect, uploadSingle('avatar'), handleUploadError, updateProfile );

module.exports = router;
