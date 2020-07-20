const { paginate } = require("../../utils");
const { validate, validateTags } = require("../../utils");
const { catchAsync } = require("../../utils");
const Post = require("../../models/postSchema");
const ApplicationResponse = require("../../utils/routeResponse");
const ApplicationError = require("../../utils/AppError");

exports.removePosts = catchAsync(async (req, res, next) => {
  await Post.deleteMany();
  res.json(new ApplicationResponse());
});

exports.removePost = catchAsync(async (req, res, next) => {
  // 1. get the post name from req params
  const { postId } = req.params;
  // 2. get the user logged in user id
  const userId = req.user._id;
  // 3. find the post to be deleted
  const post = await Post.findById(postId);
  // send error if post does not exist
  if (!post) {
    return next(
      new ApplicationError(
        "The post you are trying to delete was not found",
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
  res.json(
    new ApplicationResponse(
      {
        message: `Post ${post.title} successfully deleted`,
        post: {},
      },
      204
    )
  );
});

exports.getPosts = catchAsync(async (req, res, next) => {
  // try to find the posts
  const posts = await Post.find();

  // paginate posts
  const result = paginate(posts);
  console.log(result);
  // 2. respond with the posts
  res.json(new ApplicationResponse(result));
});

exports.getPost = catchAsync(async (req, res, next) => {
  // 1. get post id from request parameters;
  const { postId } = req.params;
  // 2. find the post by it's id
  const foundPost = await Post.findById(postId).select("-__v");
  // 3. make sure the post exist
  if (!foundPost)
    return next(
      new ApplicationError("This post is missing from our records", 404)
    );
  // populate all comments, and author fields for this post
  foundPost.populate("author", (err, data) => {
    if (err)
      return next(
        new ApplicationResponse("Could not populate author for the post")
      );
    res.json(new ApplicationResponse({ post: foundPost }));
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  // // 1. collect user input from
  // const { title, content, summary } = req.body;
  // let { tags } = req.body;
  // // 2. validate input
  // if (!validate(title, content, summary, content)) {
  //   return next(new ApplicationError('Please fill all required fields'));
  // }
  // // 3. validate post tags
  // tags = validateTags(tags);
  // if (!tags) {
  //   return next(
  //     new ApplicationError(
  //       'These are invalid Tags try using names like Web Dev, NodeJS as tags for your post'
  //     )
  //   );
  // }
  // 4. create and retieve the post back
  const createdPost = new Post(req.body);
  // 5. associate the post to it's auhtor
  createdPost.author = req.user.id;
  // create a tag object for each of the provided tags
  // tags = validateTags(tags);
  // insert tags to tags property of post
  // createdPost.tags.push(...tags);
  // 6. save post to DB
  await createdPost.save();
  // 7. send it to api post author
  res.status(201).json(new ApplicationResponse({ post: createdPost }, 201));
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const { postId } = req.params;
  const userId = req.user.id;
  const { title, summary, content } = req.body;
  let { tags } = req.body;
  if (!validate(title, summary, content))
    return next(
      new ApplicationError("Please fill all form fields correctly", 400)
    );
  tags = validateTags(tags);
  const updatedPost = await Post.updateOne(
    { _id: postId, author: userId },
    { $set: { title, summary, content, tags } }
  );
  if (!updatedPost.ok) {
    res.json(new ApplicationResponse({ message: "Post was not updated" }));
  }
  res.json(
    new ApplicationResponse({
      post: { _id: postId, title, summary, content, tags },
    })
  );
});
