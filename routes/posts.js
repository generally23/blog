const router = require("express").Router();

// route access authorization and restriction functions
const protectRoute = require("../controllers/authHandlers/route");
const preventAccessTo = require("../controllers/authHandlers/restrict");
const commentRoutes = require("./comments");

// routes handlers
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  removePost,
  removePosts,
} = require("../controllers/routeHandlers/posts");

const USER = "User";

router
  .route("/")
  // get all posts
  .get(getPosts)
  // create or add a post
  .post(protectRoute, preventAccessTo(USER), createPost)
  // remove all posts restrict to normal user
  .delete(protectRoute, preventAccessTo(USER), removePosts);

router
  .route("/:postId")
  // get a specific post by its id
  .get(getPost)
  // update a specific post by its id
  .patch(protectRoute, preventAccessTo(USER), updatePost)
  // remove a specific postby its id
  .delete(protectRoute, preventAccessTo(USER), removePost);

router.use("/:postId/comments", commentRoutes);

module.exports = router;
