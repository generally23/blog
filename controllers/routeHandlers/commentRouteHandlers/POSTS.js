const Comment = require('../../../models/commentSchema');
const { catchAsync } = require('../../utils');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const Post = require('../../../models/postSchema');

exports.createComment = catchAsync(async (req, res, next) => {
  // variables
  const { content } = req.body;
  const { postId } = req.params;
  // 1. do not allow to create comment on a post that does not exist
  if (!await Post.findById(postId)) {
    return next(new ApplicationError('You are trying to comment on an unexisting post', 400));
  }
  // 3. validate comment content or text
  if (!content)
    return next(new ApplicationError('Cannot create an empty comment', 400));
  // 4. create a comment document
  const comment = new Comment({ content });
  // 5. associate the comment with the user who created it
  comment.author = req.user._id;
  // 6. associate the comment to the post it is create on
  comment.post = postId;
  // 7. save the comment to DB
  await comment.save();
  // 8. respond with the created comment
  res.status(201).json(new ApplicationResponse({ comment }));
});

// Comments Sub Routes Creators

exports.createCommentReply = catchAsync(async (req, res, next) => {
  // variables
  const commentText = req.body.content;
  const { commentId } = req.params;
  const { postId } = req.params;
  // 1. do not allow to reply to a comment that is on a post that does not exist
  if (!await Post.findById(postId)) {
    return next(new ApplicationError('You are trying to reply to an unexisting comment on an unexisting post', 400))
  }
  // 2. validate commentText
  if (!commentText)
    return next(new ApplicationError('Cannot create an empty reply', 400));
  // 2. find the comment that got the reply
  const comment = await Comment.findById(commentId);
  // 3. send an error if the comment was not found or does ot exist
  if (!comment)
    return next(
      new ApplicationError("The comment you're replying to was not found", 404)
    );
  // 4. create a new reply comment
  const reply = new Comment({ content: commentText });
  // 5. associate the reply to its creator
  reply.author = req.user.id;
  // 6. associate the reply to the the post it was on
  reply.post = postId;
  // 7. associate the comment to the reply
  reply.replyTo = commentId;
  // 8. save reply to DB
  await reply.save();
  // 9. send the reply back
  res.status(201).json(new ApplicationResponse({ reply }));
});

module.exports = exports;
