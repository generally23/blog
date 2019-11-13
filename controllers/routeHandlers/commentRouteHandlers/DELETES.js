const { catchAsync } = require('../../utils');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const Comment = require('../../../models/commentSchema');

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
        'You are trying to delete a comment that does not exist',
        404
      )
    );
  }
  // 5. make sure requesting user own this comment
  if (!comment.author.equals(userId)) {
    return next(
      new ApplicationError('You do not own this comment to delete it', 403)
    );
  }
  // 6. if we make it here then comment was found and user owns it so delete comment
  await Comment.deleteOne({ _id: commentId });
  // 7. acknowledge comment deletion
  res.json(
    new ApplicationResponse({
      message: 'Comment sucessfully deleted',
      comment: {}
    })
  );
});

exports.deleteComments = catchAsync(async (req, res, next) => {
  // 1. get post id
  const { postId } = req.params;
  // 2. try to remove it
  await Comment.deleteMany({ post: postId });
  // acknowledge comment deletion
  res.json(
    new ApplicationResponse({ message: 'Comments sucessfully wiped out for this post' })
  );
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
    return next(new ApplicationError(`No reply was found with this id ${replyId}`, 404));
  }
  // 5. check if user does not own the reply and send an error
  if (!reply.author.equals(userId)) {
    return next(new ApplicationError('You do not this comment to delete it', 403))
  }
  // 6. try deleting the comment since user owns it
  await Comment.deleteOne({ _id: replyId });
  // 7. send acknlodgment back
  res.json(
    new ApplicationResponse({ message: 'Reply was successully deleted', reply: {} })
  );
});

// exports.deleteMyComments = catchAsync(async (req, res, next) => {
//   // 1. remove all comments which has author as current requesting user
//   const operationResult = await Comment.deleteMany({ author: req.user._id });
//   if (operationResult.deletedCount < 1) {
//     return res.json(
//       new ApplicationResponse({
//         message: 'You have not commented posts on this site yet'
//       })
//     );
//   }
//   res.json(
//     new ApplicationResponse({
//       message: 'All of your comments on this site were successfully deleted'
//     })
//   );
// });

module.exports = exports;
