const { errorResponse } = require('../utils/apiResponse');
const { ROLES } = require('../utils/constants');


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Not authenticated');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `User role '${req.user.role}' is not authorized to access this route`
      );
    }

    next();
  };
};


const adminOnly = authorize(ROLES.ADMIN);


const instructorOnly = authorize(ROLES.INSTRUCTOR);


const studentOnly = authorize(ROLES.STUDENT);


const instructorOrAdmin = authorize(ROLES.INSTRUCTOR, ROLES.ADMIN);

module.exports = {
  authorize,
  adminOnly,
  instructorOnly,
  studentOnly,
  instructorOrAdmin,
};