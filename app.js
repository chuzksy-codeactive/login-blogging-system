var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var flash = require("connect-flash");
var expressValidator = require("express-validator");
var bycrpt = require("bcrypt-nodejs");
var path = require("path");
var moment = require("moment");

// Authentication Packages
let session = require("express-session");
let passport = require("passport");
let LocalStrategy = require("passport-local");
const MongoStore = require("connect-mongo")(session);

var index = require("./routes/index");
var users = require("./routes/users");
var posts = require("./routes/posts");

// Create the Express application object
var app = express();

// set up mongoose connection
var mongoose = require("mongoose");
var url = "mongodb://localhost/mongo_node_blog";
mongoose.connect(url);
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB Connection Error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
    session({
        secret: "keyboard cat",
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({ url: "mongodb://localhost/mongo_node_blog" })
    })
);
app.use(expressValidator());
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.locals.truncatedText = function(text, length) {
    var truncatedText = text.substring(0, length);
    return truncatedText;
};

// Make use of this middleware before hitting our routes.
app.use(function(req, res, next) {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.path = path;
    res.locals.moment = moment;
    if (req.isAuthenticated()) {
        res.locals.userId = req.user.user_id;
    }
    next();
});

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/uploads/blog", express.static(__dirname + "/uploads/blog"));

app.use("/", index);
app.use("/users", users);
app.use("/blog", posts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error("Not Found");
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});

module.exports = app;