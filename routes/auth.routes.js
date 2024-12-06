const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');

const authController = require('../controllers/auth.controller');

router.post('/signup', [
    body('userName').trim().notEmpty().withMessage('Please enter a username').isLength({min: 3, max: 20}).withMessage('Username must be between 3 and 20 characters'),
    body('displayName').trim().notEmpty().withMessage('Please enter a display name').isLength({min: 3, max: 20}).withMessage('Username must be between 3 and 20 characters'),
    body('email').trim().isEmail().withMessage('Please enter a valid email').custom(async (value, {req}) =>{
        const user = await User.findOne({email: value});
        if(user){
            throw new Error('A user with this email already exists');
        }
        return true;
    }),
    body('password').trim().isStrongPassword({minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1}).withMessage('The password must be at least 6 characters long and must contain at least 1 uppercase letter, 1 lowercase letter and 1 number'),
    body('confirmPassword').custom((value, {req}) =>{
        if(value !== req.body.password){
            throw new Error('Password confirmation must match the password');
        }
        return true;
    })
], authController.signup);

let user;

router.post('/login', [
    body('email').trim().isEmail().withMessage('Please enter a valid email').custom(async (value, {req}) =>{
        user = await User.findOne({email: value});
        if(!user){
            throw new Error('A user with this email does not exist');
        }
        return true;
    }),
    body('password').trim().custom(async (value, {req}) =>{
        if(!user){
            return false;
        }
        const isMatch = await bcrypt.compare(value, user.password);
        if(!isMatch){
            throw new Error('Password is incorrect');
        }
        return true;
    })
],  authController.login);

module.exports = router;