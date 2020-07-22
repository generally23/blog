const ApplicationError = require("../../utils/AppError");

exports.HandleDbCastError = (err) => {
  return new ApplicationError(
    `The value ${err.value} is an invalid ${err.path}`
  );
};

exports.HandleDbValidationError = (err) => {
  return new ApplicationError(err);
};

exports.HandleDbDuplicateKeyError = (err) => {
  return new ApplicationError(err);
};

module.exports = exports;
