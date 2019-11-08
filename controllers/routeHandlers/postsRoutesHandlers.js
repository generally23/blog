const { 
    findAll,
    createOne,
    findOne,
    removeOne,
    removeAll
} = 
require('./genericHandlers');
const { catchAsync } = require('../errorHandlers/helpers');
const Post = require('../../models//schemas/postsSchema');
const ApplicationResponse = require('./routeResponse');
const ApplicationError = require('../errorHandlers/AppError');

exports.getPosts = catchAsync(async (req, res, next) => {
    // 1. fetch all posts from api
    const posts = await findAll(Post);
    // 2. respond with the posts
    res.status(200).json(
        new ApplicationResponse({ data: posts })
    );
});

exports.createPost = catchAsync(async (req, res, next) => {
    // 1. collect user input from
    const { title, content, summary } = req.body;
    // 2. create and retieve the post back
    const createdPost = createOne(Post, { title, content, summary });
    // 3. associate the post to it's auhtor
    createdPost.author = req.user.id;
    // .4 save post to DB
    await createdPost.save();
    // 5. send it to api consumer
    res.status(201).json(
        new ApplicationResponse({ createdPost }, 201)
    );
});

exports.getPost = catchAsync(async (req, res, next) => {
    // 1. get post id from request parameters;
    const { postId } = req.params;
    // 2. find the post by it's id
    const foundPost = await findOne(Post, { _id: postId });
    // 3. make sure the post exist
    if (!foundPost) return next(new ApplicationError('This post is missing from our records', 404));
    // 4. respond with the found post
    res.status(200).json(
        new ApplicationResponse({ data: foundPost })
    )
});

exports.updatePost = catchAsync(async (req, res, next) => {

});

exports.removePost = catchAsync(async (req, res, next) => {
    // 1. get the post name from req params
    const postId = req.params.postId
    await removeOne(Post, { postId });
    res.status(200).json(
        new ApplicationResponse({ data: {} })
    )
});

exports.removePosts = catchAsync(async (req, res, next) => {
    await removeAll(Post);
    res.status(200).json(
        new ApplicationResponse({ data: {} })
    )
})

module.exports = exports;
