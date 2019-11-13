const { catchAsync } = require('../utils');
const ApplicationError = require('../utils/AppError');

const preventAccessTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next(
        new ApplicationError(
          'You are not allowed to perform these actions',
          403
        )
      );
    }
    next();
  };
};

module.exports = preventAccessTo;
