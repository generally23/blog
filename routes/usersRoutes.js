const router = require('express').Router();

const protectRoute = require('../controllers/authHandlers/routeAuthorizer');
const preventAcessTo = require('../controllers/authHandlers/restrict');

const {
  signup,
  signin,
  getMyAccount,
  logout,
  deleteMyAccount,
  getAccounts,
  deleteAccounts,
  forgotPassword,
  deleteAccount,
  resetPassword
} = require('../controllers/routeHandlers/usersRouteHandlers');

// get all user accounts
router
  .route('/')
  .get(protectRoute, preventAcessTo('user'), getAccounts)
  .delete(protectRoute, preventAcessTo('user'), deleteAccounts);

// sign user up
router.post('/signup', signup);

// Sign user in
router.post('/signin', signin);

router
  .route('/my_account')
  // get user info
  .get(protectRoute, getMyAccount)
  // get user info
  .delete(protectRoute, deleteMyAccount);

// deletes someone's account, only logged in admin can do this
router.delete(
  '/:accountId',
  protectRoute,
  preventAcessTo('user'),
  deleteAccount
);

// log user out
router.post('/logout', protectRoute, logout);

// forget password
router.post('/forgotPassword', forgotPassword);

// reset password
router.get('/resetPassword/:resetToken', resetPassword);

module.exports = router;

