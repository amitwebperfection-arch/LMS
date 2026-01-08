const { errorResponse } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  errorResponse(res, 404, `Route not found - ${req.originalUrl}`);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Server Error';

  if (err.name === 'CastError') {
    message = 'Resource not found';
    statusCode = 404;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    message = `${field} already exists`;
    statusCode = 400;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(', ');
    statusCode = 400;
  }

  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token expired';
    statusCode = 401;
  }

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  errorResponse(
    res,
    statusCode,
    message,
    process.env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
};

module.exports = {
  notFound,
  errorHandler,
};