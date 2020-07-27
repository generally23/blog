const router = require('express').Router();
const protectRoute = require('../controllers/authHandlers/route');
const preventAcessTo = require('../controllers/authHandlers/restrict');
const upload = require('../utils/avatarUploader');
const {
  signup,
  signin,
  logout,
  getMyAccount,
  updateMyAccount,
  deleteMyAccount,
  getAccounts,
  deleteAccounts,
  forgotPassword,
  deleteAccount,
  resetPassword,
  changePassword,
  updateAvatar,
} = require('../controllers/routeHandlers/users');

const restrictedUsers = ['user'];

// get all user accounts
router
  .route('/')
  .get(protectRoute, preventAcessTo(restrictedUsers), getAccounts)
  .delete(protectRoute, preventAcessTo(restrictedUsers), deleteAccounts);

// sign user up
router.post('/signup', signup);

// sign user in
router.post('/signin', signin);

router
  .route('/my-account')
  // get user info
  .get(protectRoute, getMyAccount)
  // update user account
  .patch(protectRoute, updateMyAccount)
  // delete user account
  .delete(protectRoute, deleteMyAccount);

// deletes someone's account, only logged in admin can do this
router.delete(
  '/:accountId',
  protectRoute,
  preventAcessTo(restrictedUsers),
  deleteAccount
);

// log user out
router.post('/logout', protectRoute, logout);

// forget password
router.post('/forgot-password', forgotPassword);

// reset password
router.patch('/reset-password/:resetToken', resetPassword);

// change password
router.patch('/change-password', protectRoute, changePassword);

// update user avatar
router.patch(
  '/update-avatar',
  protectRoute,
  upload.single('avatar'),
  updateAvatar
);

module.exports = router;
