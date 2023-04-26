const express = require("express");
const router = express.Router();
const announcementService = require("../services/announcementService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createAnnouncement", [auth, faculty], asyncMiddleware(announcementService.createAnnouncement));
router.get("/getAnnouncements", [auth], asyncMiddleware(announcementService.getAnnouncements));
router.get("/getAnnouncement/:id", [auth], asyncMiddleware(announcementService.getAnnouncement));
router.put("/updateAnnouncement/:id", [auth, faculty], asyncMiddleware(announcementService.updateAnnouncement));
router,delete("/deleteAnnouncement/:id", [auth, faculty], asyncMiddleware(announcementService.deleteAnnouncement));

module.exports = router;