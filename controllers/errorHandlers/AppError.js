class ApplicationError extends Error {
    constructor (errmessage, statusCode = 500) {
        super(errmessage);
        this.isOperational = true;
        this.statusCode = statusCode;
        this.status = String(statusCode).startsWith('4') ? 'failed' : 'error';
        Error.captureStackTrace(this, this.constructor);
    }
}


module.exports = ApplicationError;