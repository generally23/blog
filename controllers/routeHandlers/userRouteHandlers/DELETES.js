const { catchAsync } = require('../../utils');
const ApplicationResponse = require('../../utils/routeResponse');
const User = require('../../../models/userSchema');

exports.deleteAccount = catchAsync(async (req, res, next) => {
  // deletes a user account
  // Note: this route is restricted to unauthenticated accounts
  const operationResult = await User.deleteOne({ _id: req.params.accountId });
  if (operationResult.deletedCount < 1) {
    return res.json(
      new ApplicationResponse({ message: 'User does not exist to be deleted' })
    );
  }
  res.json(new ApplicationResponse({ message: 'User succesfully deleted' }));
});

exports.deleteMyAccount = catchAsync(async (req, res, next) => {
  // deletes a user account
  await User.deleteOne({ _id: req.user.id });
  res.json(
    new ApplicationResponse({
      message: 'Account sucessfully deleted',
      user: {}
    })
  );
});

exports.deleteAccounts = catchAsync(async (req, res, next) => {
  // remove all existing accounts or users
  // Note: this route is restricted even to normal logged in accounts
  const operationResult = await User.deleteMany();
  if (operationResult.deletedCount < 1) {
    return res.json(
      new ApplicationResponse({
        message: 'Found no accounts to delete',
        users: []
      })
    );
  }
  res.json(new ApplicationResponse({ users: [] }));
});

module.exports = exports;
