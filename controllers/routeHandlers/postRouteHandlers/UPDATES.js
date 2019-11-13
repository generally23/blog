const { catchAsync } = require('../../utils');
const Post = require('../../../models/postSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const { validate, validateTags } = require('../../utils');

exports.updatePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const { title, summary, content } = req.body;
  let { tags } = req.body;
  if (!validate(title, summary, content))
    return next(
      new ApplicationError('Please fill all form fields correctly', 400)
    );
  tags = validateTags(tags);
  const updatedPost = await Post.updateOne(
    { _id: postId, author: userId },
    { $set: { title, summary, content, tags } }
  );
  if (!updatedPost.ok) {
    res.json(new ApplicationResponse({ message: 'Post was not updated' }));
  }
  res.json(
    new ApplicationResponse({
      post: { _id: postId, title, summary, content, tags }
    })
  );
});

module.exports = exports;
