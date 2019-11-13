const { catchAsync } = require('../../utils');
const Post = require('../../../models/postSchema');
const ApplicationResponse = require('../../utils/routeResponse');
const ApplicationError = require('../../utils/AppError');
const { validate, validateTags } = require('../../utils');

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

module.exports = exports;
