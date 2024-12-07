const Post = require('../models/post.model');
const User = require('../models/user.model');
const {validationResult} = require('express-validator');

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