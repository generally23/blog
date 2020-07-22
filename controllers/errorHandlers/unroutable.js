const ApplicationError = require("../../utils/AppError");

module.exports = (req, res, next) => {
  next(
    new ApplicationError(
      `The route ${req.originalUrl} does not exist on this server`
    ),
    404
  );
};
