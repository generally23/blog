const router = require('express').Router();

// route access authorization and restriction functions
const protectRoute = require('../controllers/authHandlers/routeAuthorizer');
const preventAccessTo = require('../controllers/authHandlers/restrict');
const commentRoutes = require('./commentsRoutes');

// routes handlers
const {
  getPosts,
  createPost,
  getPost,
  updatePost,
  removePost,
  removePosts
} = require('../controllers/routeHandlers/postsRoutesHandlers');

router.use('/:postId/comments', commentRoutes);

router
  .route('/')
  // get all posts
  .get(getPosts)
  // create or add a post
  .post(protectRoute, preventAccessTo('user'), createPost)
  // remove all posts restrict to normal user
  .delete(protectRoute, preventAccessTo('user'), removePosts);

router
  .route('/:postId')
  // get a specific post by its id
  .get(getPost)
  // update a specific post by its id
  .patch(protectRoute, preventAccessTo('user'), updatePost)
  // remove a specific postby its id
  .delete(protectRoute, preventAccessTo('user'), removePost);

module.exports = router;
