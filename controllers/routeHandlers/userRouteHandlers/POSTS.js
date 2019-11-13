const { sign } = require('jsonwebtoken');
const { catchAsync } = require('../../utils');
const User = require('../../../models/userSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const { validate } = require('../../utils');
const senMailTo = require('../../authHandlers/mailer');

const generateToken = id => sign({ id }, process.env.JWT_SECRET);

exports.signup = catchAsync(async (req, res, next) => {
  // 1. get secret request query and check it to allow user admin creation
  const { secret } = req.query;
  // 2. get input from user
  const { username, email, password, confirmedPassword } = req.body;
  // 3. validate user input
  if (!validate(username, email, password, confirmedPassword))
    return next(new ApplicationError('Please fill all the form fields', 400));
  // 4. create an account with the input
  const user = new User({
    username,
    email,
    password,
    confirmedPassword
  });
  // 5. change user role to be admin if secret is verified
  if (secret && secret === process.env.ADMIN_CREATION_SECRET) {
    user.role = 'admin';
  }
  // 6. switch account to being active
  user.isActive = true;
  // 7. generate a token for the account
  const token = generateToken(user._id);
  // 8. save user to DB
  await user.save();
  // 9. send account info and token
  res.status(201).json(new ApplicationResponse({ user, token }, 201));
});

exports.signin = catchAsync(async (req, res, next) => {
  // 1. get user email and password
  const { email, password } = req.body;
  // 2. make sure their inputs are't empty
  if (!validate(email, password)) {
    return next(
      new ApplicationError('Please fill all the fields in the form', 400)
    );
  }
  // 3. try finding user with their email
  const user = await User.findOne({ email }).select('+password');
  // 4. prevent user loggin if not found by email
  if (!user) {
    return next(
      new ApplicationError(
        'You are tying to sign in with an unexisting account verify your email or password',
        401
      )
    );
  }
  // 5. verify if user has a valid password
  const isValidPassword = await user.verifyPassword(password, user.password);
  // 5. send back a new error password is invalid
  if (!isValidPassword)
    return next(
      new ApplicationError('Your email or password is incorrect', 401)
    );
  // 6. sign a new token for user
  const token = generateToken(user._id);
  // 7. send token back along with the user info
  res.json(
    new ApplicationResponse({
      user,
      token
    })
  );
});

exports.logout = catchAsync(async (req, res, next) => {
  // retrieve all existing accounts or users
  // Note: this route is restricted to unauthenticated accounts
  req.user = undefined;
  res.json(
    new ApplicationResponse({
      message: 'Successfully logged you out',
    })
  );
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. get user email
  const { email } = req.body;
  // 2. if there is no email send an error
  if (!email) {
    return next(new ApplicationError('You must provide you email to reset your password', 400))
  }
  // 3. find the user by his/her email
  const user = await User.findOne({ email });
  // 4. send an error if user does'nt exist
  if (!user)
    return next(
      new ApplicationError(
        'This user account does not exist in our records',
        404
      )
    );
  // 5. generate a reset token for this user
  const resetToken = user.generatePasswordResetToken();
  //console.log(91)
  // 6. save modified info into DB
  await user.save({ validateBeforeSave: false });
  // 7. construct a url to send to the user to reset their password
  const resetUrl = `${req.protocol}://${req.hostname}/blog/v1/accounts/resetPassword/${resetToken}`
  try {
    await senMailTo({
      from: 'rallygene0@gmail.com',
      to: email,
      subject: 'Reset your password in the next 15 minutes',
      text: `We have received a request from you to reset your password please send a request to ${resetUrl} to reset you password`
    });
    res.json(
      new ApplicationResponse({ message: 'We have successgully sent you an email to reset your password' })
    )
  } catch (e) {
    console.log(e)
  }
  console.log(req.ip)
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { resetToken } = req.params
});

module.exports = exports;
