const  { catchAsync } = require('../errorHandlers/helpers')
const User = require('../../models/schemas/userSchema');
const ApplicationError = require('../errorHandlers/AppError');
const { verify } = require('jsonwebtoken');

const protectRoute = catchAsync(async (req, res, next) => {
    // 1. get authorization bearer from request headers
    const encoded = req.headers['authorization'];
    // 2. don't allow user to continue if encoded does not exist
    if (!encoded) return next(new ApplicationError('You are not logged in, please login to access this resource', 401));
    // 3. split the bearer token to just get the token
    const token = encoded.split(' ')[1];
    // 4. verify the token is valid
    const decoded = verify(token, process.env.JWT_SECRET);
    // 5. try finding the user with the id included in the token payload
    const user = await User.findById(decoded.id);
    // 6. check if the user has not changed their password after the token was issued
    const userUpdatedPasswordAfterTokenIssued = user.updatedPasswordAfter(decoded.iat);
    // if password was changed then invalidate all previous tokens
    if (userUpdatedPasswordAfterTokenIssued) return next(new ApplicationError('You are not logged in, please login to access this resource', 401))
    // set the user to request user object
    req.user = user;
    // proceed to the next route
    next();
});

module.exports = protectRoute;
