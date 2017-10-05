var express = require("express");
var router = express.Router();
var postController = require("../controllers/postController");
var multer = require("multer");
var upload = multer({ dest: "./uploads/blog" });

router.get("/add_posts", postController.post_form);
router.post("/add_posts", upload.single("image"), postController.submit_post);
router.get("/blog_posts", postController.blog_posts);
router.get("/category/:category", postController.category);
router.get("/show/:id", postController.show);
router.post("/show/addcomment", postController.addcomment);

module.exports = router;