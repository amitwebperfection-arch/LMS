const jwt = require('jsonwebtoken');
const User = require('../models/User.model');
const { errorResponse } = require('../utils/apiResponse');


const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 401, 'Not authorized to access this route');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return errorResponse(res, 401, 'User not found');
      }

      if (req.user.isBlocked) {
        return errorResponse(res, 403, 'Your account has been blocked');
      }

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