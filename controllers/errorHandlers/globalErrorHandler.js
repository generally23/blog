const ApplicationError = require('../utils/AppError');
const {
  HandleDbCastError,
  HandleDbDuplicateKeyError,
  HandleDbValidationError
} = require('./MongogooseErrors');

const sendErrorResponse = (err, res, includeField) => {
  res.status(err.statusCode).json({
    ...err,
    message: err.message,
    [includeField]: err[includeField]
  });
};

const sendDevErrors = (err, res) => {
  // dev errors
  if (err.isOperational) {
    // operational error dev
    sendErrorResponse(err, res, 'stack');
  } else {
    // send the error
    res.status(500).send({
      ...err
    });
  }
};

const sendProdErrors = (err, res) => {
  if (err.name === 'CastError') {
    HandleDbCastError(err, res);
  }
  if (err.name === 'ValidationError') {
    HandleDbValidationError(err, res);
  }
  // prod errors
  if (err.isOperational) {
    // operational error in prod
    sendErrorResponse(err, res);
  } else {
    // programming or unexpected error in production don't leak any info
    res.status(500).send({
      status: 'failed',
      message: 'Something went wrong!',
      statusCode: 500
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    sendDevErrors(err, res);
  }
  if (process.env.NODE_ENV === 'production') {
    sendProdErrors(err, res);
  }
};

module.exports = globalErrorHandler;
