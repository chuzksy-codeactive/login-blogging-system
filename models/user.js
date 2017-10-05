var bcrypt = require("bcrypt-nodejs");
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = Schema({
    firstname: { type: String, required: true, lowercase: true },
    lastname: { type: String, required: true, lowercase: true },
    username: {
        type: String,
        required: true,
        min: 6,
        max: 25,
        lowercase: true
    },
    email: { type: String, required: true, lowercase: true },
    password: { type: String, required: true },
    image_url: { type: String },
    image_name: { type: String }
}, { runSettersOnQuery: true });

UserSchema.virtual("fullname").get(function() {
    return `${this.firstname} ${this.lastname}`;
});

UserSchema.virtual("url").get(function() {
    return "/users/profile/" + this._id;
});

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

// create the model for users and expose it to our app
var User = (module.exports = mongoose.model("User", UserSchema));

module.exports.findUserByUsername = function(username, email, callback) {
    User.findOne({ $or: [{ username: username }, { email: email }] },
        "username email password",
        callback
    );
};

module.exports.findUser = function(username, callback) {
    query = { username: username };
    User.findOne(query, callback);
};

// module.exports.findUserById = function(id, callback){
//     query {}
// }