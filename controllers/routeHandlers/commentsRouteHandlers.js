const Post = require("../../models/postSchema");
const { catchAsync } = require("../../utils");
const ApplicationResponse = require("../../utils/routeResponse");
const ApplicationError = require("../../utils/AppError");
const Comment = require("../../models/commentSchema");

exports.deleteComment = catchAsync(async (req, res, next) => {
  // 1. get comment id
  const { commentId } = req.params;
  // 2. get user id
  const userId = req.user._id;
  // 3. try to find the comment
  const comment = await Comment.findById(commentId);
  // 4. if no comment is found then send comment unfound error
  if (!comment) {
    return next(
      new ApplicationError(
        "You are trying to delete a comment that does not exist",
        404
      )
    );
  }
  // 5. make sure requesting user own this comment
  if (!comment.authorId.equals(userId)) {
    return next(
      new ApplicationError("You do not own this comment to delete it", 403)
    );
  }
  // 6. if we make it here then comment was found and user owns it so delete comment
  await Comment.deleteOne({ _id: commentId });
  // 7. acknowledge comment deletion
  res.json(new ApplicationResponse());
});

exports.deleteComments = catchAsync(async (req, res, next) => {
  // 1. get post id
  const { postId } = req.params;
  // 2. try to remove it
  await Comment.deleteMany({ postId });
  // acknowledge comment deletion
  res.json(new ApplicationResponse());
});

exports.deleteCommentReply = catchAsync(async (req, res, next) => {
  // 1. get comment id for which to delete the reply for
  const { replyId } = req.params;
  // 2. get logged in user id
  const { userId } = req.user._id;
  // 3. try finding the reply
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
      new ApplicationError("You do not this comment to delete it", 403)
    );
  }
  // 6. try deleting the comment since user owns it
  await Comment.deleteOne({ _id: replyId });
  // 7. send acknlodgment back
  res.json(
    new ApplicationResponse({
      message: "Reply was successully deleted",
      reply: {},
    })
  );
});

exports.deleteMyComments = catchAsync(async (req, res, next) => {
  // 1. remove all comments which has author as current requesting user
  const operationResult = await Comment.deleteMany({ author: req.user._id });
  if (operationResult.deletedCount < 1) {
    return res.json(
      new ApplicationResponse({
        message: "You have not commented posts on this site yet",
      })
    );
  }
  res.json(
    new ApplicationResponse({
      message: "All of your comments on this site were successfully deleted",
    })
  );
});

exports.getComments = catchAsync(async (req, res, next) => {
  // 1. get the post id for which to find comments for
  const { postId } = req.params;
  // 2. try finding the comments
  const comments = await Comment.find({
    postId,
    replyTo: { $exists: false },
  }).populate("authorId");
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

exports.createComment = catchAsync(async (req, res, next) => {
  // variables
  const { content } = req.body;
  const { postId } = req.params;
  // 1. do not allow to create comment on a post that does not exist
  if (!(await Post.findById(postId))) {
    return next(
      new ApplicationError(
        "You are trying to comment on an unexisting post",
        400
      )
    );
  }
  // 3. validate comment content or text
  if (!content) {
    return next(new ApplicationError("Cannot create an empty comment", 400));
  }
  // 4. create a comment document
  const comment = new Comment({ content });
  // 5. associate the comment with the user who created it
  comment.authorId = req.user._id;
  // 6. associate the comment to the post it is create on
  comment.postId = postId;
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
  if (!(await Post.findById(postId))) {
    return next(
      new ApplicationError(
        "You are trying to reply to an unexisting comment on an unexisting post",
        400
      )
    );
  }
  // 2. validate commentText
  if (!commentText) {
    return next(new ApplicationError("Cannot create an empty reply", 400));
  }
  // 2. find the comment that got the reply
  const comment = await Comment.findById(commentId);
  // 3. send an error if the comment was not found or does ot exist
  if (!comment) {
    return next(
      new ApplicationError("The comment you're replying to was not found", 404)
    );
  }
  // 4. create a new reply comment
  const reply = new Comment({ content: commentText });
  // 5. associate the reply to its creator
  reply.authorId = req.user._id;
  // 6. associate the reply to the the post it was on
  reply.postId = postId;
  // 7. associate the comment to the reply
  reply.replyTo = commentId;
  // 8. save reply to DB
  await reply.save();
  // 9. send the reply back
  res.status(201).json(new ApplicationResponse({ reply }));
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  // 1. find the comment to update by id
  const comment = await Comment.findById(commentId);
  // 2. send an error if comment does not exist
  if (!comment) {
    return next(new ApplicationError("Comment to update not found", 404));
  }
  // 3. collect user input
  const { content } = req.body;
  if (!content) {
    return next(
      new ApplicationError("You cannot update a comment by an empty one")
    );
  }
  // 4. update the comment content and the status to being edited
  comment.content = content;
  // 5. mark this comment as an edited one
  comment.isEdited = true;
  // 6. save changes
  await comment.save();
  // 7. send acknoledgment back
  res.json(new ApplicationResponse({ comment }));
});
