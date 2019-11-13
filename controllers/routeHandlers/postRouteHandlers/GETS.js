const { catchAsync } = require('../../utils');
const Post = require('../../../models/postSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const { validate } = require('../../utils');

exports.getPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({}, { __v: 0 });
  // 2. respond with the posts
  res.json(new ApplicationResponse({ posts, results: posts.length }));
});

exports.getPost = catchAsync(async (req, res, next) => {
  // 1. get post id from request parameters;
  const { postId } = req.params;
  // 2. find the post by it's id
  const foundPost = await Post.findById(postId).select('-__v');
  // 3. make sure the post exist
  if (!foundPost)
    return next(
      new ApplicationError('This post is missing from our records', 404)
    );
  // populate all comments, and author fields for this post
  foundPost.populate('author', (err, data) => {
    if (err)
      return next(
        new ApplicationResponse('Could not populate author for the post')
      );
    res.json(new ApplicationResponse({ post: foundPost }));
  });
});

module.exports = exports;
