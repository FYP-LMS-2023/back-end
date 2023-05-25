const express = require("express");
const router = express.Router();
const channelService = require("../services/channelService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

//deprecated
router.post(
  "/createChannel",
  auth,
  asyncMiddleware(channelService.createChannel)
);

router.post(
  "/createThread/:id",
  auth,
  asyncMiddleware(channelService.createThread)
);
router.post(
  "/createComment",
  auth,
  asyncMiddleware(channelService.createComment)
);
router.get("/getChannel/:id", auth, asyncMiddleware(channelService.getChannel));

router.post(
  "/createCommentOnThread/:id",
  auth,
  asyncMiddleware(channelService.createCommentOnThread)
);
router.post(
  "/replyToComment/:id",
  auth,
  asyncMiddleware(channelService.replyToComment)
);
router.post(
  "/upvoteThread/:id",
  auth,
  asyncMiddleware(channelService.upvoteThread)
);
router.post(
  "/downvoteThread/:id",
  auth,
  asyncMiddleware(channelService.downvoteThread)
);

router.get("/getThread/:id", auth, asyncMiddleware(channelService.getThread));

//comment and reply
router.post(
  "/upvoteComment/:id",
  auth,
  asyncMiddleware(channelService.upvoteComment)
);
router.post(
  "/downvoteComment/:id",
  auth,
  asyncMiddleware(channelService.downvoteComment)
);
router.post(
  "/upvoteReply/:id",
  auth,
  asyncMiddleware(channelService.upvoteReply)
);
router.post(
  "/downvoteReply/:id",
  auth,
  asyncMiddleware(channelService.downvoteReply)
);

router.patch(
  "/deleteThread/:id",
  [auth, faculty],
  asyncMiddleware(channelService.markThreadAsDeleted)
);
router.patch(
  "/deleteComment/:id",
  [auth, faculty],
  asyncMiddleware(channelService.markCommentAsDeleted)
);
router.patch(
  "/deleteReply/:id",
  [auth, faculty],
  asyncMiddleware(channelService.markReplyAsDeleted)
);

module.exports = router;
