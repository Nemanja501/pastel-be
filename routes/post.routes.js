const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const postController = require('../controllers/post.controller');
const isAuth = require('../middleware/is-auth.middleware');

router.post('/post', [
    body('content').notEmpty().withMessage('Content is required').isLength({max: 200}).withMessage("Can't enter more than 200 characters"),
    body('userId').notEmpty().withMessage('User id is required')
], isAuth, postController.addPost);
router.get('/post/:postId', isAuth, postController.getSinglePost);
router.get('/feed', isAuth, postController.getFeedPosts);
router.get('/explore', isAuth, postController.getExplorePosts);
router.post('/search', isAuth, postController.postSearch);
router.post('/comment', [
    body('content').notEmpty().withMessage('Content is required').isLength({max: 200}).withMessage("Can't enter more than 200 characters"),
    body('userId').notEmpty().withMessage('User id is required'),
    body('postId').notEmpty().withMessage('Post id is required'),
], isAuth, postController.postComment);

module.exports = router;