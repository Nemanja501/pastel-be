const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/users/edit', isAuth, userController.getEditUserData);
router.put('/users/edit', isAuth, userController.putEditUser);
router.get('/users/:userId', isAuth, userController.getUser);
router.post('/follow', isAuth, userController.followUser);
router.post('/unfollow', isAuth, userController.unfollowUser);

module.exports = router;