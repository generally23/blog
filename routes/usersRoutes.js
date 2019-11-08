const router = require('express').Router();

const protectRoute = require('../controllers/authHandlers/routeAuthorizer');
const restictTo = require('../controllers/authHandlers/restrict');

const 
{
    signup,
    signin,
    getMyAccount,
    logout,
    deleteAccount,
    getAccounts,
    deleteAccounts
} = require('../controllers/routeHandlers/userRouteHandlers');

// get all user accounts
router.route('/')
    .get(protectRoute, restictTo('user'), getAccounts)
    .delete(protectRoute, restictTo('user'), deleteAccounts);

// sign user up
router.post('/signup', signup);

// Sign user in
router.post('/signin', signin);

// get user info
router.route('/my_account')
    .get(protectRoute, getMyAccount)
    .delete(protectRoute, deleteAccount);

// log user out
router.post('/logout', protectRoute, logout);

module.exports = router;