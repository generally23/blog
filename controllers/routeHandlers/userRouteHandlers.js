const { sign } = require('jsonwebtoken');
const { catchAsync } = require('../errorHandlers/helpers');
const { 
    findAll,
    createOne,
    findOne,
    removeOne,
    removeAll
} = 
require('./genericHandlers');
const User = require('../../models/schemas/userSchema');
const ApplicationResponse = require('./routeResponse');
const ApplicationError = require('../errorHandlers/AppError');
const { validate } = require('../util');

const generateToken = id => sign({ id }, process.env.JWT_SECRET);

exports.signup = catchAsync(async (req, res, next) => {
    // get secret request query and check it to allow user admin creation
    const { secret } = req.query;
    // get input from user
    const { username, email, password, confirmedPassword } = req.body;
    // make sure their inputs are't empty
    if (!validate(username, email, password, confirmedPassword)) {
        return next(new ApplicationError('Please fill all the fields in the form', 400));
    }
    // create an account with the input
    const user = createOne(User, { username, email, password, confirmedPassword });
    // change user role to be admin if secret is verified
    if (secret && (secret === process.env.ADMIN_CREATION_SECRET)) {
        user.role = 'admin';
    }
    // switch account to being active
    user.isActive = true;
    // generate a token for the account
    const token = generateToken(user._id);
    // save user to DB
    await user.save();
    // send account info and token
    res.status(201).json(
        new ApplicationResponse({ user, token }, 201)
    );
})

exports.signin = catchAsync(async (req, res, next) => {
    // 1. get user email and password
    const { email, password } = req.body;
    // 2. make sure their inputs are't empty
    if (!validate(email, password)) {
        return next(new ApplicationError('Please fill all the fields in the form', 400));
    }
    // 3. try finding user with their email
    const user = await findOne(User, { email }, '+password');
    // 4. prevent user loggin if not found by email
    if (!user) {
        return next(new ApplicationError('You are tying to sign in with an unexisting account verify your email or password', 401))
    }
    // 5. verify if user has a valid password
    const isValidPassword = await user.verifyPassword(password, user.password);
    // 5. send back a new error password is invalid
    if (!isValidPassword) return next(new ApplicationError('Your email or password is incorrect', 401));
    // 6. sign a new token for user 
    const token = generateToken(user._id);
    // send token back along with the user info
    res.status(200).json(
        new ApplicationResponse({
            data: user,
            token
        })
    );
})

exports.getMyAccount = catchAsync(async (req, res, next) => {
    res.status(200).json(
        new ApplicationResponse({ data: req.user })
    );
});

exports.getAccounts = catchAsync(async (req, res, next) => {
    const users = await findAll(User);
    res.status(200).json(
        new ApplicationResponse({ data: users })
    )
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
    removeOne(User, { _id: req.user.id });
    res.status(200).json(
        new ApplicationResponse({ data: {} })
    )
});

exports.deleteAccounts = catchAsync(async (req, res, next) => {
    await removeAll(User);
    res.status(200).json(
        new ApplicationResponse( { data: {} } )
    )
});

exports.logout = catchAsync(async (req, res, next) => {
    req.user = undefined;
    res.status.json(
        ApplicationResponse({ message: 'logged you out' })
    );
})

module.exports = exports;


