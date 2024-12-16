const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/is-auth.middleware');
const userController = require('../controllers/user.controller');

router.get('/users/:userId', isAuth, userController.getUser);
router.post('/follow', isAuth, userController.followUser);

module.exports = router;