const User = require('../models/user.model');
const bcrypt = require('bcrypt');
const {validationResult} = require('express-validator');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const userName = req.body.userName;
    const displayName = req.body.displayName;
    const email = req.body.email;
    const password = req.body.password;
    const hashedPw = await bcrypt.hash(password, 12);
    const user = new User({
        userName,
        displayName,
        email,
        password: hashedPw
    });
    await user.save();
    res.status(201).json({message: 'Account created successfully', user: user});
}

exports.login = async (req, res, next) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        return next(error);
    }
    const email = req.body.email;
    const user = await User.findOne({email: email});
    const token = jwt.sign({
        email,
        userId: user._id.toString()
    }, 'mysecret', {expiresIn: '2h'});
    res.status(200).json({token, userId: user._id.toString()});
}