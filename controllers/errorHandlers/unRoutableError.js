const ApplicationError = require('../utils/AppError');

const handleUnexistingRoute = (req, res, next) => {
  next(
    new ApplicationError(
      `The route ${req.originalUrl} does not exist on this server`
    ),
    404
  );
};

module.exports = handleUnexistingRoute;
