const { generateToken, catchAsync, same, assign } = require("../../utils");
const sendMailTo = require("../authHandlers/mailer");
const User = require("../../schemas/user");
const ApplicationError = require("../../utils/AppError");
const crypto = require("crypto");

exports.deleteAccount = catchAsync(async (req, res, next) => {
  /* 
    Delete a user account
    Note: this route is restricted to normal authenticated accounts
  */

  // delete the account
  await User.deleteOne({ _id: req.params.accountId });
  // respond to client
  res.status(204).json({ m: "" });
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  // deletes a user account
  await User.deleteOne({ _id: req.user._id });
  res.status(204).json();
});

exports.deleteAccounts = catchAsync(async (req, res, next) => {
  /* 
    remove all existing accounts or users
    Note: this route is restricted even to normal logged in accounts
  */

  // delete the accounts
  await User.deleteMany();
  // respond to client
  res.status(204).json();
});

exports.getMyAccount = catchAsync(async (req, res, next) => {
  /*
    if user makes it to this route then they are
    authenticated, now send them their data back
  */

  const user = req.user;
  // respond with user
  res.json({ user });
});

exports.getAccounts = catchAsync(async (req, res, next) => {
  // retrieve all existing accounts or users
  // Note: this route is restricted even to normal logged in accounts
  const users = await User.find();
  res.json({ users });
});

exports.signup = catchAsync(async (req, res, next) => {
  // get secret request query and check it to allow user admin creation
  const { secret } = req.query;
  // get input from user
  const { username, email, password, confirmedPassword } = req.body;
  // check if user already exist
  if (await User.findOne({ email })) {
    return next(
      new ApplicationError(
        "There is already an account with these credentials. Please log in or reset your password"
      )
    );
  }
  // create a new account
  const user = new User({
    username,
    email,
    password,
    confirmedPassword,
  });
  // change user role to be admin if secret is verified
  if (secret && secret === process.env.ADMIN_CREATION_SECRET) {
    user.role = "Admin";
  }
  // switch account to being active
  user.isActive = true;
  // generate a token for the account
  const token = generateToken(user._id);
  // save user to DB
  await user.save();
  // send account info and token
  res.status(201).json({ user, token });
});

exports.signin = catchAsync(async (req, res, next) => {
  // get user email and password
  const { email, password } = req.body;
  // try finding user with their email
  const user = await User.findOne({ email });
  // prevent user loggin if not found by email
  if (!user) {
    return next(
      new ApplicationError(
        "You are tying to sign in with wrong credentials. Please verify your email or password",
        401
      )
    );
  }
  // verify if user has a valid password
  const isPasswordValid = await user.verifyPassword(password, user.password);
  // send back a new error password is invalid
  if (!isPasswordValid) {
    return next(
      new ApplicationError(
        "Please make sure you enter the correct password",
        401
      )
    );
  }
  // sign a new token for user
  const token = generateToken(user._id);
  // send token back along with the user info
  res.json({
    user,
    token,
  });
});

exports.logout = catchAsync(async (req, res, next) => {
  // retrieve all existing accounts or users
  // Note: this route is restricted to unauthenticated accounts
  req.user = undefined;
  res.status(204).json();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user email
  const { email } = req.body;
  // find the user by email
  const user = await User.findOne({ email });
  // send an error if user does'nt exist
  if (!user) {
    return next(
      new ApplicationError("No account was found with this email address", 404)
    );
  }
  // generate a reset token for this user
  const resetToken = user.generatePasswordResetToken();
  // save modified info into DB
  await user.save({ validateBeforeSave: false });
  // construct a url to send to the user to reset their password
  const resetUrl = `${req.protocol}://${req.hostname}/blog/v1/accounts/reset-password/${resetToken}`;

  try {
    await sendMailTo({
      from: "rallygene0@gmail.com",
      to: email,
      subject: "Password reset request",
      text: `We have received a request from you to reset your password please send a request to ${resetUrl} to reset you password`,
    });
    res.json({
      message: "Successfully sent reset instructions to your email address",
    });
  } catch (e) {
    return next(
      new ApplicationError(
        "Unfortunately, the email failed to deliver to your email address"
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // reset token
  const { resetToken } = req.params;
  // get current password and new password
  const { currentPassword, newPassword } = req.body;
  // if no currentPassword and newPassword send error
  // if current password and new password are the same, send an error
  if (currentPassword && newPassword && same(currentPassword, newPassword)) {
    return next(
      new ApplicationError(
        "Your new password cannot be the same as your current password",
        400
      )
    );
  }
  // hash reset token received from client
  const resetTokenHash = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // find user with hashed reset token who's time has not expired
  const user = await User.findOne({
    passwordResetToken: resetTokenHash,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new ApplicationError(
        "Your reset token is either invalid or has expired",
        401
      )
    );
  }

  // update all the information
  assign(user, {
    password: newPassword,
    passwordChangeTime: Date.now(),
    passwordResetToken: undefined,
    passwordResetTokenExpiresIn: undefined,
  });
  // resave all changes to Database
  await user.save();
  // respond to client
  res.json({ message: "You have successfully updated your password" });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  // get previous password and new password
  const { currentPassword, newPassword } = req.body;
  // send error if no currentPassword or newPassword provided
  if (!currentPassword || !newPassword) {
    return next(
      new ApplicationError(
        "current password and new password fields are required",
        401
      )
    );
  }
  // current logged in user
  const user = req.user;
  // verify current password
  const isPasswordValid = await user.verifyPassword(
    currentPassword,
    user.password
  );

  if (!isPasswordValid) {
    return next(
      new ApplicationError(
        "Incorrect password. Please enter a correct one",
        401
      )
    );
  }
  // change user password and generate a new token
  assign(user, { password: newPassword });
  // resave changes to the Database
  await user.save();
  // respond to client
  res.json({
    message:
      "Password successfully changed. You will soon receive a confirmation email from us",
  });
});
