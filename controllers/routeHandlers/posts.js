const { catchAsync, paginate, assign } = require('../../utils');
const Post = require('../../schemas/post');
const ApplicationError = require('../../utils/AppError');
const { default: slugify } = require('slugify');

exports.getPosts = catchAsync(async (req, res, next) => {
  // try to find the posts
  const posts = await Post.find();
  // paginate posts
  const result = paginate(posts);
  // respond with the posts
  res.json({ result });
});

exports.getPost = catchAsync(async (req, res, next) => {
  // find the post by it's id
  const post = await Post.findById(req.params.postId);
  // make sure the post exist
  if (!post)
    return next(
      new ApplicationError('This post is missing from our records', 404)
    );
  // populate all comments, and author fields for this post
  await post.populate('virtualAuthor');
  // respond to client with post
  res.json({ post });
});

exports.createPost = catchAsync(async (req, res, next) => {
  // create and retieve the post back
  const post = new Post(req.body);
  // associate the post to it's auhtor
  assign({ authorId: req.user.id, slug: slugify(post.title) }, post);
  // save post to DB
  await post.save();
  // respond to client with post
  res.status(201).json({ post }, 201);
});

exports.updatePost = catchAsync(async (req, res, next) => {
  // try to find the post to update
  const post = await Post.findById(req.params.postId);
  // if no post is found send a not found error
  if (!post) {
    return next(
      new ApplicationError(
        'The post you are trying to update was not found',
        404
      )
    );
  }
  // check if user is not owner of this post send an error
  if (!post.authorId.equals(req.user.id)) {
    return next(
      new ApplicationError(
        'You cannot update this post because you are not the owner',
        401
      )
    );
  }
  // collect all allowed properties to update
  const { title, summary, content } = req.body;
  // perform changes
  assign({ title, summary, content }, post);
  // resave changes to DB
  await post.save();
  res.json({ post });
});

exports.removePosts = catchAsync(async (req, res, next) => {
  await Post.deleteMany();
  res.json();
});

exports.removePost = catchAsync(async (req, res, next) => {
  // 1. get the post name from req params
  const { postId } = req.params;
  // 2. get the user logged in user id
  const userId = req.user.id;
  // 3. find the post to be deleted
  const post = await Post.findById(postId);
  // send error if post does not exist
  if (!post) {
    return next(
      new ApplicationError(
        'The post you are trying to delete was not found',
        404
      )
    );
  }
  // 4. do not delete if user does not own the post
  if (!post.authorId.equals(userId)) {
    return next(
      new ApplicationError(
        "You don't have permission to delete a Post you do not own",
        403
      )
    );
  }
  // 5. delete the post the post
  await Post.deleteOne({ _id: postId });
  // 6. send a message back acknowledging post delete
  res.status(204).json();
});
