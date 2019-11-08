const  { catchAsync } = require('../errorHandlers/helpers')
const ApplicationError = require('../errorHandlers/AppError');

const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (roles.includes(req.user.role)) {
            return next(new ApplicationError('You are not allowed to perform these actions', 403));
        }
        next();
    }
};

module.exports = restrictTo;
