var Post = require("../models/post");
var User = require("../models/user");
var path = require("path");
var express = require("express");
var router = express.Router();
var app = express();

exports.addcomment = function(req, res, next) {
    let post_id = req.body.post_id;
    req.checkBody("comment", "comment field must not be empty").notEmpty();
    req.sanitize("comment").trim();

    let comment = {
        body: req.body.comment,
        post_user: res.locals.userId
    };

    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            errors = result.array().map(error => {
                return error.msg;
            });
            Post.findById(post_id, function(err, posts) {
                if (err) return next(err);
                res.render("show", { post: posts, title: "", errors });
            });
        } else {
            let comments = { body: req.body.comment, post_user: res.locals.userId };
            Post.update({ _id: post_id }, { $push: { comments } }, function(
                err,
                post
            ) {
                if (err) return next(err);
                console.log("From post: " + post);
                res.location("/blog/show/" + post_id);
                res.redirect("/blog/show/" + post_id);
            });
        }
    });
};
exports.submit_post = function(req, res, next) {
    req.checkBody("title", "Title field must not be empty").notEmpty();
    req.checkBody("body", "Body field must not be empty").notEmpty();

    req.sanitize("title").trim();
    req.sanitize("body").trim();

    if (req.file) {
        var image_url = req.file.path;
        var image_name = req.file.originalname;
        console.log("Original Image name: " + image_name);
    } else {
        image_name = "globe.jpg";
        image_url = "uploads/blog/globe.jpg";
    }

    let errors = [];
    let post = {
        title: req.body.title,
        category: req.body.category,
        body: req.body.body,
        image_url: image_url,
        image_name: image_name
    };
    console.log(req.body);
    console.log(post);

    req.getValidationResult().then(function(result) {
        if (!result.isEmpty()) {
            errors = result.array().map(error => {
                return error.msg;
            });
            res.render("post", { errors, post, title: "Error in Posting Blog" });
        } else {
            let post = new Post({
                title: req.body.title,
                category: req.body.category,
                author: req.user.user_id,
                body: req.body.body,
                image_url,
                image_name
            });
            console.log(req.user.user_id);
            post.save(function(err, post) {
                if (err) return next(err);
                res.redirect("/blog/blog_posts");
            });
        }
    });
};

exports.blog_posts = function(req, res, next) {
    Post.find({})
        .populate("author")
        .sort("-date")
        .exec(function(err, results) {
            if (err) return next(err);
            res.render("blog_posts", {
                title: "View Posts",
                authors_blog: results
            });
        });
};

exports.post_form = function(req, res, next) {
    res.render("post", { title: "Add Post", errors: "" });
};

exports.category = function(req, res, next) {
    Post.find({ category: req.params.category })
        .populate("author")
        .sort("-date")
        .exec(function(err, results) {
            if (err) next(err);
            res.render("blog_posts", { title: "View Posts", authors_blog: results });
        });
};

exports.show = function(req, res, next) {
    let populateQuery = [{ path: "author" }, { path: "comments.post_user" }];
    Post.findById(req.params.id)
        .populate(populateQuery)
        .sort("-comments.date")
        .exec(function(err, results) {
            if (err) next(err);
            //console.log(results.comments.toObject());
            res.render("show", { post: results, title: "" });
        });
};