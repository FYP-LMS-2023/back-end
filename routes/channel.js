const express = require("express");
const router = express.Router();
const channelService = require("../services/channelService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createChannel", auth, asyncMiddleware(channelService.createChannel));
router.post("/createThread", auth, asyncMiddleware(channelService.createThread));
router.post("/createComment", auth, asyncMiddleware(channelService.createComment));
router.get("/getChannel/:id", auth, asyncMiddleware(channelService.getChannel));


router.post("/createCommentOnThread", auth, asyncMiddleware(channelService.createCommentOnThread));
router.post("/replyToComment", auth, asyncMiddleware(channelService.replyToComment));
router.post("/upvoteThread", auth, asyncMiddleware(channelService.upvoteThread));
router.post("/downvoteThread", auth, asyncMiddleware(channelService.downvoteThread));

router.get("/getThread/:id", auth, asyncMiddleware(channelService.getThread));


module.exports = router;