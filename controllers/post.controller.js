const Post = require('../models/post.model');
const User = require('../models/user.model');
const {validationResult} = require('express-validator');
const constants = require('../shared/constants');

exports.addPost = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const content = req.body.content;
    const userId = req.body.userId;
    const userInDatabase = await User.findById(userId);
    if(!userInDatabase){
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
    }
    const post = new Post({
        content,
        user: userId
    });
    const postInDatabase = await post.save();
    userInDatabase.posts.push(postInDatabase);
    await userInDatabase.save();
    return res.status(201).json({message: 'Post added successfully'});
}

exports.getFeedPosts = async (req, res, next) =>{
    const userId = req.query.userId;
    const page = req.query.page || 1;
    const user = await User.findById(userId).populate({ path: 'following', 
        populate: { path: 'posts', 
        options: {limit: constants.PER_PAGE, skip: (page - 1) * constants.PER_PAGE, 
            populate: {path: 'user'}
        }} 
    })
    const feedPosts = user.following.map(_user => {
        return _user.posts;
    })
    const posts = feedPosts[0];
    return res.status(200).json({message: 'Feed posts fetched successfully', posts, page});
}

exports.getExplorePosts = async (req, res, next) =>{
    const page = req.query.page || 1;
    const posts = await Post.find().populate('user').skip((page - 1) * constants.PER_PAGE).limit(constants.PER_PAGE);
    return res.status(200).json({message: 'Explore posts fetched successfully', posts, page});
}