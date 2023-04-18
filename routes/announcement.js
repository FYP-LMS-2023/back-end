const express = require("express");
const router = express.Router();
const announcementService = require("../services/announcementService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");

router.post("/createAnnouncement", auth, asyncMiddleware(announcementService.createAnnouncement));


module.exports = router;