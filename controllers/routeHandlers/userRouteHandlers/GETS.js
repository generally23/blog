const User = require('../../../models/userSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const { catchAsync } = require('../../utils');

exports.getMyAccount = catchAsync(async (req, res, next) => {
  /* if user makes it to this route then they are
     authenticated, now send them their data back
    */
  res.json(new ApplicationResponse({ user: req.user }));
});

exports.getAccounts = catchAsync(async (req, res, next) => {
  // retrieve all existing accounts or users
  // Note: this route is restricted even to normal logged in accounts
  const users = await User.find();
  res.json(new ApplicationResponse({ users }));
});
