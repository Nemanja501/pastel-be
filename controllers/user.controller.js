const User = require('../models/user.model');
const constants = require('../shared/constants');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');

// finds two users in the database: the one who is being followed by the other user, and the follower
findFollowerAndUser = async (req, res, next, populatePosts = false) => {
    const followerId = req.body.followerId || req.query.followerId;
    const userId = req.body.userId || req.params.userId;
    const follower = await User.findById(followerId);
    let user;
    const page = req.query.page || 1;
    if(populatePosts) {
        user = await User.findById(userId).populate({path: 'posts', 
                    options: {sort: {createdAt: -1},
                    skip: (page - 1) * constants.PER_PAGE,
                    limit: constants.PER_PAGE} , 
        })
    } else {
        user = await User.findById(userId);
    }
    const error = new Error('User not found');
    error.statusCode = 404;
    if(!user || !follower) {
        return next(error);
    }
    return {follower, user};
}

// check if user is following another user
checkIfUserFollows = (follower, user) => {
    let isFollowing = false;
    user.followers.forEach(_follower => {
        if(_follower.equals(follower._id)) {
            isFollowing = true;
        }
    })
    return isFollowing;
}

// checks if the currently logged in user is the one visiting their own page
isCurrentUserPage = (follower, user) => {
    if(follower._id.equals(user._id)) {
        return true;
    }
    return false;
}

exports.getUser = async (req, res, next) =>{
    let isFollowing = false;
    let isCurrentUser = false;
    const response = await findFollowerAndUser(req, res, next, true);
    const follower = response.follower;
    const user = response.user;
    if(isCurrentUserPage(follower, user)) {
        isCurrentUser = true;
    }
    else if(checkIfUserFollows(follower, user)) {
        isFollowing = true;
    }
    return res.status(200).json({message: 'User fetched successfully', user, isFollowing, isCurrentUser});
}

exports.followUser = async (req, res, next) =>{
    const response = await findFollowerAndUser(req, res, next);
    const follower = response.follower;
    const user = response.user;
    follower.following.push(user);
    user.followers.push(follower);
    await follower.save();
    await user.save();
    return res.status(200).json({message: 'User followed successfully'});
}

exports.unfollowUser = async (req, res, next) =>{
    const response = await findFollowerAndUser(req, res, next);
    const follower = response.follower;
    const user = response.user;
    follower.following.pull(user._id);
    user.followers.pull(follower._id);
    await follower.save();
    await user.save();
    return res.status(200).json({message: 'User unfollowed successfully'});
}

exports.getEditUserData = async (req, res, next) => {
    const userId = req.query.userId;
    const user = await User.findById(userId);
    if(!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
    }
    return res.status(200).json({message: 'User data fetched successfully', user});
}

exports.putEditUser = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const userId = req.query.userId;
    const userName = req.body.userName;
    const displayName = req.body.displayName;
    const email = req.body.email;
    const password = req.body.password;
    let hashedPw;
    if(password) {
        hashedPw = await bcrypt.hash(password, 12);
    }
    const user = await User.findById(userId);
    if(!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
    }
    user.userName = userName;
    user.displayName = displayName;
    user.email = email;
    if(hashedPw) user.password = hashedPw;
    await user.save();
    return res.status(204).json({message: 'User updated successfully'});
}