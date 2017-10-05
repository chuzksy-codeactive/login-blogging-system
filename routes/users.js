var userController = require('../controllers/usersController');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './uploads' });

router.get('/login', userController.login);
router.post('/login', userController.loginUser);
router.get('/logout', userController.logout);
router.get('/profile/:id', userController.authenticationMiddleware(), userController.profile);
router.get('/signup', userController.signup);
router.post('/signup', upload.single('image'), userController.signup_post);

module.exports = router;