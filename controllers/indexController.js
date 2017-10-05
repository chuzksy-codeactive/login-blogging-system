var passport = require('passport');
var User = require('../models/user');

// Renders the index page
exports.index = function(req, res, next) {
    console.log(req.user);
    console.log(req.isAuthenticated());
    res.render('index', { title: 'Welcome to Home page' });
};