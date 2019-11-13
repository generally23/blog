const { catchAsync } = require('../../utils');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const Comment = require('../../../models/commentSchema');

exports.updateComment = catchAsync(async (req, res, next) => {
  const { commentId } = req.params;
  // 1. find the comment to update by id
  const comment = await Comment.findById(commentId);
  // 2. send an error if comment does not exist
  if (!comment) {
    return next(new ApplicationError('Comment to update not found', 404));
  }
  // 3. collect user input
  const { content } = req.body;
  if (!content) {
    return next(
      new ApplicationError('You cannot update a comment by an empty one')
    );
  }
  // 4. update the comment content and the status to being edited
  comment.content = content;
  comment.isEdited = true;
  // 5. save changes
  await comment.save();
  // send acknoldgment back
  res.json(new ApplicationResponse({ comment }));
});

module.exports = exports;
