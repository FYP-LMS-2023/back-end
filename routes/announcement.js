const express = require("express");
const router = express.Router();
const announcementService = require("../services/announcementService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createAnnouncement", [auth, faculty], asyncMiddleware(announcementService.createAnnouncement));


module.exports = router;