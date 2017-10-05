var mongoose = require("mongoose");
var User = require("../models/user");
var Schema = mongoose.Schema;

var PostSchema = Schema({
    title: { type: String, required: true },
    category: { type: String, require: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    body: { type: String, require: true },
    image_url: { type: String },
    image_name: { type: String },
    date: { type: Date, default: Date.now },
    comments: [{
        body: { type: String },
        date: { type: Date, default: Date.now },
        post_user: { type: Schema.Types.ObjectId, ref: "User" }
    }]
});

// create the model for users and expose it to our app
var Post = (module.exports = mongoose.model("Post", PostSchema));