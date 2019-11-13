const { catchAsync } = require('../../utils');
const ApplicationResponse = require('../../utils/routeResponse');
const Comment = require('../../../models/commentSchema');

exports.getComments = catchAsync(async (req, res, next) => {
  // 1. get the post id for which to find comments for
  const { postId } = req.params;
  // 2. try finding the comments
  const comments = await Comment.find({
    post: postId,
    replyTo: { $exists: false }
  }).populate('author');
  // 3. send the comments back
  res.json(new ApplicationResponse({ comments, results: comments.length }));
});

// Comments Sub Routes Readers
exports.getCommentReplies = catchAsync(async (req, res, next) => {
  // 1. get the comment id for which to get replies for
  const { commentId } = req.params;
  // 2. try to find the replies for this comment
  const replies = await Comment.find({ replyTo: commentId });
  // 3. send the replies back
  res.json(new ApplicationResponse({ replies, results: replies.length }));
});

module.exports = exports;
