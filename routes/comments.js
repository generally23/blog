const router = require('express').Router({ mergeParams: true });

const protectRoute = require('../controllers/authHandlers/route');
const preventAccessTo = require('../controllers/authHandlers/restrict');

const {
  getComments,
  getCommentReplies,
  createComment,
  createCommentReply,
  deleteCommentReply,
  deleteComment,
  updateComment,
  deletePostComments,
  deleteMyComments,
} = require('../controllers/routeHandlers/comments');

router
  // blog/v1/posts/:postId/comments
  .route('/')
  // get all comments for a specific post
  .get(getComments)
  // add a comment for a specific post
  .post(protectRoute, createComment)
  // delete all comments on a post, only logged in administrators are allowed
  .delete(protectRoute, preventAccessTo('user'), deletePostComments);

router
  // blog/v1/posts/:postId/comments/:commentId
  .route('/:commentId')
  // update the comment with this id
  .patch(protectRoute, updateComment)
  // delete the comment with this id
  .delete(protectRoute, deleteComment);

// Comments Sub Routes
router
  // blog/v1/posts/:postId/comments/:commentId/replies
  .route('/:commentId/replies')
  .get(getCommentReplies)
  .post(protectRoute, createCommentReply);

router
  // blog/v1/posts/:postId/comments/:commentId/replies/:replyId
  .route('/:commentId/replies/:replyId')
  .patch()
  .delete(protectRoute, deleteCommentReply);

module.exports = router;
