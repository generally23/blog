const { catchAsync } = require('../../utils');
const Post = require('../../../models/postSchema');
const Comment = require('../../../models/commentSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const { validate } = require('../../utils');

exports.removePosts = catchAsync(async (req, res, next) => {
  const operationResult = await Post.deleteMany();
  if (operationResult.deletedCount < 1) {
    return res.json(
      new ApplicationResponse({ message: 'Posts empty found none to delete' })
    );
  }
  res.json(
    new ApplicationResponse({
      message: 'successfully wiped out all Posts',
      posts: [],
      results: 0
    })
  );
});

exports.removePost = catchAsync(async (req, res, next) => {
  // 1. get the post name from req params
  const { postId } = req.params;
  // 2. get the user logged in user id
  const userId = req.user.id;
  // 3. find the post to be deleted
  const post = await Post.findById(postId);
  // 4. do not delete if user does not own the post
  if (!post.author.equals(userId)) {
    return next(
      new ApplicationError(
        "You don't have permission to delete a Post you do not own",
        403
      )
    );
  }
  // 5. delete the post the post
  await Post.deleteOne({ _id: postId });
  // 6. send a message back acknoledging post delete
  res.json(
    new ApplicationResponse({
      message: `Post ${post.title} successfully deleted`,
      post: {}
    })
  );
});

module.exports = exports;
