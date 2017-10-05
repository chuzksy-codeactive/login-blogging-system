var expressValidator = require("express-validator");
var bcrypt = require("bcrypt-nodejs");
var path = require("path");
var User = require("../models/user");
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let user_id = "";
var loggedInUser = "";

var express = require("express");
var app = express();
// Renders the Login page
exports.login = function(req, res, next) {
    res.render("login", { title: "Login", message: "" });
};

exports.loginUser = function(req, res, next) {
    passport.authenticate("local", function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render("login", { message: info.message, title: "" });
        }
        req.logIn(user, function(err) {
            console.log("Request user " + req.user.user_id);
            if (err) {
                return next(err);
            } else {
                return res.redirect("/");
            }
        });
    })(req, res, next);
};

exports.logout = function(req, res, next) {
    req.logout();
    req.session.destroy();
    res.redirect("/users/login");
};

exports.profile = function(req, res, next) {
    User.findById(req.params.id, function(err, user) {
        if (err) throw err;
        console.log("User Information: " + user);
        console.log("User fullname: " + user.fullname);
        return res.render("profile", {
            title: "Profile",
            result: "",
            user: user,
            image: path.normalize(user.image_url)
        });
    });
};

// Renders the Signup page
exports.signup = function(req, res, next) {
    res.render("signup", {
        title: "Register",
        errors: "",
        user: {},
        message: ""
    });
};

// Handle User Signin on POST
exports.signup_post = function(req, res, next) {
    req.checkBody("username", "Username must not be empty").notEmpty();
    req
        .checkBody("username", "Username must be between 6-25 character long")
        .len(6, 25);
    req.checkBody("firstname", "Firstname must not be empty").notEmpty();
    req.checkBody("lastname", "Lastname must not be empty").notEmpty();
    req.checkBody("email", "Email field must not be empty").notEmpty();
    req.checkBody("email", "Invalid email address").isEmail();
    req.checkBody("password", "Password field must not be empty").notEmpty();
    req
        .checkBody("password", "Password must be between 8-100 character long")
        .len(8, 100);
    req.checkBody("password2", "Password field must not be empty").notEmpty();
    req.checkBody("password2", "Password mismatch").equals(req.body.password);

    req.sanitize("username").trim();
    req.sanitize("firstname").trim();
    req.sanitize("lastname").trim();
    req.sanitize("email").trim();

    if (req.file) {
        var image_url = req.file.path;
        var image_name = req.file.originalname;
        console.log("Original Image name: " + image_name);
    } else {
        image_name = "no_image.png";
        image_url = "no_image_url";
    }

    let errors = [];

    let user = {
        username: req.body.username,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: req.body.password,
        password2: req.body.password2,
        image_url: image_url,
        image_name: image_name
    };

    let hashPassword = bcrypt.hashSync(
        req.body.password,
        bcrypt.genSaltSync(8),
        null
    );

    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            errors = result.array().map(e => {
                return e.msg;
            });
            res.render("signup", { title: "Registration Error", user, errors });
        } else {
            User.findUserByUsername(req.body.username, req.body.email, function(
                err,
                result
            ) {
                if (err) console.log("error" + err);
                if (result) {
                    if (result.username == req.body.username) {
                        req.flash("loginError", "Username is already taken");
                        res.render("signup", { errors: req.flash("loginError"), user });
                    }
                    if (result.email == req.body.email) {
                        req.flash("loginError", "Email is already taken");
                        res.render("signup", { errors: req.flash("loginError"), user });
                    }
                    if (
                        result.username == req.body.username &&
                        result.email == req.body.email
                    ) {
                        req.flash("loginError", "Username and Email are already taken");
                        res.render("signup", { errors: req.flash("loginError"), user });
                    }
                }
                if (!result) {
                    var newUser = new User({
                        username: req.body.username,
                        firstname: req.body.firstname,
                        lastname: req.body.lastname,
                        email: req.body.email,
                        password: hashPassword,
                        image_url,
                        image_name
                    });
                    newUser.save(function(err, user) {
                        if (err) return next(err);
                        user_id = user._id;
                        res.redirect("/users/login");
                    });
                }
            });
        }
    });
};

passport.serializeUser(function(user_id, done) {
    done(null, user_id);
});

passport.deserializeUser(function(user_id, done) {
    done(null, user_id);
});

exports.authenticationMiddleware = function() {
    return (req, res, next) => {
        console.log(
            `req.session.passport.user: ${JSON.stringify(req.session.passport)}`
        );
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect("/users/login");
    };
};

passport.use(
    new LocalStrategy(function(username, password, done) {
        User.findOne({ $or: [{ username: username }, { email: username }] },
            "username email password",
            function(err, user) {
                if (err) return done(err);
                if (!user) {
                    return done(null, false, {
                        message: "Wrong username or email entered"
                    });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: "Wrong password entered" });
                }
                if (user) {
                    // return done(null, user);
                    return done(null, { user_id: user._id });
                }
            }
        );
    })
);