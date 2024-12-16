const User = require('../models/user.model');

// finds two users in the database: the one who is being followed by the other user, and the follower
findFollowerAndUser = async (followerId, userId, next, populatePosts = false) => {
    const follower = await User.findById(followerId);
    let user;
    if(populatePosts) {
        user = await User.findById(userId).populate('posts');
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

checkIfUserFollows = (follower, user) => {
    let isFollowing = false;
    user.followers.forEach(_follower => {
        if(_follower.equals(follower._id)) {
            isFollowing = true;
        }
    })
    return isFollowing;
}

exports.getUser = async (req, res, next) =>{
    const userId = req.params.userId;
    const followerId = req.query.followerId;
    let isFollowing = false;
    const response = await findFollowerAndUser(followerId, userId, next, true);
    const follower = response.follower;
    const user = response.user;
    if(checkIfUserFollows(follower, user)) {
        isFollowing = true;
    }
    return res.status(200).json({message: 'User fetched successfully', user, isFollowing});
}

exports.followUser = async (req, res, next) =>{
    const followerId = req.body.followerId;
    const userId = req.body.userId;
    const response = await findFollowerAndUser(followerId, userId, next);
    const follower = response.follower;
    const user = response.user;
    follower.following.push(user);
    user.followers.push(follower);
    await follower.save();
    await user.save();
    return res.status(200).json({message: 'User followed successfully'});
}