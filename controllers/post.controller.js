const Post = require('../models/post.model');
const User = require('../models/user.model');
const Comment = require('../models/comment.model');
const mongoose = require('mongoose');
const {validationResult} = require('express-validator');
const constants = require('../shared/constants');
const ObjectId = mongoose.Types.ObjectId;

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
    const feed = await User.aggregate([
        {$match: {_id: ObjectId.createFromHexString(userId)}},  //find the currently logged in user
        {
            $lookup: {      //get all the data about the users which the current user follows
                from: 'users',
                localField: 'following',
                foreignField: '_id',
                as: 'following_info'
            }
        },
        {$unwind: '$following_info'},
        {$project: {following_info: 1}},
        {$lookup: {     //get the data about every users posts
            from: 'posts',
            localField: 'following_info.posts',
            foreignField: '_id',
            as: 'posts'
        }},
        {$unwind: '$posts'},
        {$group: {      //group all the posts from all the users together
            _id: null,
            post: {$addToSet: "$posts"}
        }},
        {$unwind: '$post'},
        {$sort: {"post.createdAt": -1}}, //sort by newest
        {$skip: (page - 1) * constants.PER_PAGE},
        {$limit: constants.PER_PAGE},
        {
            $lookup: {  //get data for author of post
                from: 'users',
                localField: 'post.user',
                foreignField: '_id',
                as: 'post.user'
            }
        },
        {$unwind: '$post.user'},
    ]);
    const posts = feed.map(post => {
        return post.post;
    })
    return res.status(200).json({message: 'Feed posts fetched successfully', posts});
}

exports.getExplorePosts = async (req, res, next) =>{
    const page = req.query.page || 1;
    const posts = await Post.find().populate('user').sort({createdAt: -1}).skip((page - 1) * constants.PER_PAGE).limit(constants.PER_PAGE);
    return res.status(200).json({message: 'Explore posts fetched successfully', posts, page});
}

exports.postSearch = async (req, res, next) => {
    const search = req.body.search;
    const posts = await Post.aggregate([
        {$match: {
            "content": {"$regex": search, "$options": "i"}
        }},
        {$lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user"
        }},
        {$unwind: '$user'},
        {
            $group: {
                "_id": "$_id",
                "content": {"$first": "$content"},
                "user": {"$first": "$user"}
            }
        }
    ]);
    const users = await User.aggregate([
        {$match: {
            $or: [ {"userName": {"$regex": search, "$options": "i"}}, {"displayName": {"$regex": search, "$options": "i"}} ]
        }},
        {
            $group: {
                "_id": "$_id",
                "userName": {"$first": "$userName"},
                "displayName": {"$first": "$displayName"},
                "email": {"$first": "$email"},
                "password": {"$first": "$password"},
                "posts": {"$push": "$posts"},
                "following": {"$push": "$following"},
                "followers": {"$push": "$followers"},
                
            }
        }
    ])
    return res.status(200).json({message: 'Search successfull', posts, users});
}

exports.getSinglePost = async (req, res, next) => {
    const page = req.query.page || 1;
    const postId = req.params.postId;
    const post = await Post.findById(postId).populate('user').populate({path: 'comments', 
        options: {sort: {createdAt: -1},
        skip: (page - 1) * constants.PER_PAGE,
        limit: constants.PER_PAGE} , 
        populate: {path: 'user'}});
    return res.status(200).json({message: 'Post fetched successfully', post});
}

exports.postComment = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const postId = req.body.postId;
    const post = await Post.findById(postId);
    if(!post) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        return next(error);
    }
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if(!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
    }
    const content = req.body.content;
    const comment = new Comment({
        content,
        post: postId,
        user: userId
    });
    await comment.save();
    post.comments.push(comment);
    await post.save();
    return res.status(201).json({message: 'Comment added successfully'});
}