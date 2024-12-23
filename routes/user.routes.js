const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/users/edit', isAuth, userController.getEditUserData);
router.put('/users/edit', [
    body('userName').trim().notEmpty().withMessage('Please enter a username').isLength({min: 3, max: 20}).withMessage('Username must be between 3 and 20 characters'),
    body('displayName').trim().notEmpty().withMessage('Please enter a display name').isLength({min: 3, max: 20}).withMessage('Username must be between 3 and 20 characters'),
    body('email').trim().isEmail().withMessage('Please enter a valid email'),
    body('password').trim().isStrongPassword({minLength: 6, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1})
    .withMessage('The password must be at least 6 characters long and must contain at least 1 uppercase letter, 1 lowercase letter and 1 number').optional({values: 'falsy'}),
    body('confirmPassword').custom((value, {req}) =>{
        if(value !== req.body.password){
            throw new Error('Password confirmation must match the password');
        }
        return true;
    }).optional({values: 'falsy'})
], isAuth, userController.putEditUser);
router.get('/users/:userId', isAuth, userController.getUser);
router.post('/follow', isAuth, userController.followUser);
router.post('/unfollow', isAuth, userController.unfollowUser);

module.exports = router;