const User = require('../models/user.model');

exports.getUser = async (req, res, next) =>{
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('posts');
    if(!user) {
        const error = new Error('User not found');
        error.statusCode = 404;
        return next(error);
    }
    return res.status(200).json({message: 'User fetched successfully', user});
}