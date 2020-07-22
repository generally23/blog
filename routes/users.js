const router = require("express").Router();

const protectRoute = require("../controllers/authHandlers/route");
const preventAcessTo = require("../controllers/authHandlers/restrict");

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
  resetPassword,
  changePassword,
} = require("../controllers/routeHandlers/users");

const USER = "User";

// get all user accounts
router
  .route("/")
  .get(protectRoute, preventAcessTo(USER), getAccounts)
  .delete(protectRoute, preventAcessTo(USER), deleteAccounts);

// sign user up
router.post("/signup", signup);

// sign user in
router.post("/signin", signin);

router
  .route("/my-account")
  // get user info
  .get(protectRoute, getMyAccount)
  // get user info
  .delete(protectRoute, deleteMyAccount);

// deletes someone's account, only logged in admin can do this
router.delete("/:accountId", protectRoute, preventAcessTo(USER), deleteAccount);

// log user out
router.post("/logout", protectRoute, logout);

// forget password
router.post("/forgot-password", forgotPassword);

// reset password
router.patch("/reset-password/:resetToken", resetPassword);

// change password
router.patch("/change-password", protectRoute, changePassword);

module.exports = router;
