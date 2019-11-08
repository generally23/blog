const ApplicationError = require('../errorHandlers/AppError');

exports.HandleDbCastError = err => {
    return new ApplicationError(`The value ${err.value} is an invalid ${err.path}`)
}

exports.HandleDbValidationError = ({ errors }) => {
    console.log(errors)
    const message = Object.values(errors).map(field => {

    }).join('')
    return new ApplicationError(message)
}

exports.HandleDbDuplicateKeyError = (err) => {
    console.log(err);
}



module.exports = exports;