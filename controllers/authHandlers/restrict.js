const ApplicationError = require("../../utils/AppError");

const preventAccessTo = (...roles) => {
  return (req, res, next) => {
    if (roles.includes(req.user.role)) {
      return next(
        new ApplicationError(
          "You do not have enough credentials to access or perform these actions",
          403
        )
      );
    }
    next();
  };
};

module.exports = preventAccessTo;
