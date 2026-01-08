const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { errorResponse } = require('../utils/apiResponse');

// Protect routes - JWT validation
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Make sure token exists
    if (!token) {
      return errorResponse(res, 401, 'Not authorized to access this route');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return errorResponse(res, 401, 'User not found');
      }

      // Check if user is blocked
      if (req.user.isBlocked) {
        return errorResponse(res, 403, 'Your account has been blocked');
      }

      // Check if user is active
      if (!req.user.isActive) {
        return errorResponse(res, 403, 'Your account is inactive');
      }

      next();
    } catch (error) {
      return errorResponse(res, 401, 'Not authorized, token failed');
    }
  } catch (error) {
    return errorResponse(res, 500, 'Server error in authentication');
  }
};

// Role-based authorization
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Not authorized to access this route');
    }

    next();
  };
};


module.exports = { protect, authorize };