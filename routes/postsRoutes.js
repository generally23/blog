const router = require('express').Router();
// import Generic route handler functions
const { 
    getPosts,
    createPost,
    getPost,
    updatePost,
    removePost,
    removePosts
} 
= require('../controllers/routeHandlers/postsRoutesHandlers');

// import route access authorization and restriction functions
const protectRoute = require('../controllers/authHandlers/routeAuthorizer');
const restrictTo = require('../controllers/authHandlers/restrict');

router.route('/')
    .get(getPosts) // get all posts
    .post(protectRoute, restrictTo('consumer'),createPost) // add a post
    .delete(protectRoute, restrictTo('consumer'), removePosts) // remove all posts restrict to normal user

router.route('/:postId')
    .get(getPost) // get a specific post
    .patch(protectRoute, restrictTo('consumer'), updatePost) // update a specific post
    .delete(protectRoute, restrictTo('consumer'), removePost) // remove a specific post
    
module.exports = router;