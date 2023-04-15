const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");

router.get("/test", auth, asyncMiddleware(authService.test));
router.post("/createUser", asyncMiddleware(authService.createUser));
router.post("/createProgram", asyncMiddleware(authService.createProgram));
router.post("/login", asyncMiddleware(authService.login));
router.get("/getProfile", auth, asyncMiddleware(authService.getProfile));
router.post("/createSemester", auth, asyncMiddleware(authService.createSemester));
router.post("/createAnnouncement", auth, asyncMiddleware(authService.createAnnouncement));
router.post("/createChannel", auth, asyncMiddleware(authService.createChannel));
router.post("/createThread", auth, asyncMiddleware(authService.createThread));
router.post("/createComment", auth, asyncMiddleware(authService.createComment));
router.get("/getChannel/:id", auth, asyncMiddleware(authService.getChannel));

router.post("/createCommentOnThread", auth, asyncMiddleware(authService.createCommentOnThread));
router.post("/replyToComment", auth, asyncMiddleware(authService.replyToComment));
router.get("/getThread/:id", auth, asyncMiddleware(authService.getThread));

router.post("/createCourse", auth, asyncMiddleware(authService.createCourse));
router.get("/getCourse/:id", auth, asyncMiddleware(authService.getCourse));
router.patch("/updateCourse/:id", auth, asyncMiddleware(authService.updateCourse));


module.exports = router;
