const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');

router.post('/post', [
    body('content').notEmpty().withMessage('Content is required').isLength({max: 200}).withMessage("Can't enter more than 200 characters"),
    body('userId').notEmpty().withMessage('User id is required')
], postController.addPost);

module.exports = router;