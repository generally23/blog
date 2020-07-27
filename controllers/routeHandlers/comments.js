const Post = require('../../schemas/post');
const { catchAsync, assign } = require('../../utils');
const ApplicationError = require('../../utils/AppError');
const Comment = require('../../schemas/comment');

exports.getComments = catchAsync(async (req, res, next) => {
  // 1. get the post id for which to find comments for
  const { postId } = req.params;
  // 2. try finding the comments
  const comments = await Comment.find({
    postId,
    replyTo: { $exists: false },
  }).populate('authorId');
  // 3. send the comments back
  res.json({ comments, results: comments.length });
});

exports.createComment = catchAsync(async (req, res, next) => {
  // variables
  const { content } = req.body;
  const { postId } = req.params;
  // 1. do not allow to create comment on a post that does not exist
  if (!(await Post.findById(postId))) {
    return next(
      new ApplicationError(
        'You are trying to comment on an unexisting post',
        400
      )
    );
  }
  // create a comment document
  const comment = new Comment({ content });
  // associate the comment with the user who created it
  comment.authorId = req.user.id;
  // associate the comment to the post it is create on
  comment.postId = postId;
  // save the comment to DB
  await comment.save();
  // respond with the created comment
  res.status(201).json({ comment });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  // find the comment to update by id
  const comment = await Comment.findById(req.params.commentId);
  // send an error if comment does not exist
  if (!comment) {
    return next(
      new ApplicationError(
        'The comment you are tring to update was not found',
        404
      )
    );
  }
  // collect comment body or content
  const { content } = req.body;
  // update comment content and set status to edited
  assign({ content, isEdited: true }, comment);
  // resave changes to DB
  await comment.save();
  // 7. send updated comment
  res.json({ comment });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  // comment id
  const { commentId } = req.params;
  // user id
  const userId = req.user.id;
  // try to find the comment
  const comment = await Comment.findById(commentId);
  // if no comment is found then send comment not found error
  if (!comment) {
    return next(
      new ApplicationError(
        'The comment you are trying to delete does not exist',
        404
      )
    );
  }
  // make sure requesting user owns this comment
  if (!comment.authorId.equals(userId)) {
    return next(
      new ApplicationError('You do not own this comment to delete it', 401)
    );
  }
  // if we make it here then comment was found and user owns it, delete comment
  await Comment.deleteOne({ _id: commentId });
  // 7. acknowledge comment deletion
  res.status(204).json();
});

exports.deletePostComments = catchAsync(async (req, res, next) => {
  // try to remove it
  await Comment.deleteMany({ postId: req.params.postId });
  // respond to client
  res.status(204).json();
});

exports.getCommentReplies = catchAsync(async (req, res, next) => {
  // try to find the replies for this comment
  const replies = await Comment.find({ replyTo: req.params.commentId });
  // send the replies back
  res.json({ replies });
});

exports.createCommentReply = catchAsync(async (req, res, next) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const { postId } = req.params;
  const authorId = req.user.id;
  // do not allow to reply to a comment that is on a post that does not exist
  if (!(await Post.findById(postId))) {
    return next(
      new ApplicationError(
        'You are trying to reply to a comment on an unexisting post',
        400
      )
    );
  }
  // find the comment that got the reply
  const comment = await Comment.findById(commentId);
  // send an error if the comment was not found
  if (!comment) {
    return next(
      new ApplicationError("The comment you're replying to was not found", 404)
    );
  }
  // 4. create a new reply comment
  const reply = new Comment({ content });

  /*
    associate reply to its creator,
    associate reply to post it was on,
    associate reply to comment
  */
  assign({ authorId, postId, replyTo: commentId }, reply);
  // save reply to DB
  await reply.save();
  // 9. send the reply back
  res.status(201).json({ reply });
});

exports.deleteCommentReply = catchAsync(async (req, res, next) => {
  // get comment id for which to delete the reply for
  const { replyId } = req.params;
  // get logged in user id
  const { userId } = req.user._id;
  // try finding the reply
  const reply = await Comment.findById(replyId);
  // 4. send an error if no reply was found
  if (!reply) {
    return next(
      new ApplicationError(`No reply was found with this id ${replyId}`, 404)
    );
  }
  // 5. check if user does not own the reply and send an error
  if (!reply.authorId.equals(userId)) {
    return next(
      new ApplicationError('You do not this comment to delete it', 403)
    );
  }
  // 6. try deleting the comment since user owns it
  await Comment.deleteOne({ _id: replyId });
  // 7. send acknlodgment back
  res.status(204).json();
});

exports.deleteMyComments = catchAsync(async (req, res, next) => {
  // 1. remove all comments which has author as current requesting user
  await Comment.deleteMany({ author: req.user.id });
  // respond to client
  res.status(204).json();
});
