const express = require("express");
const router = express.Router();
const announcementService = require("../services/announcementService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");

router.post("/createAnnouncement", [auth, faculty], asyncMiddleware(announcementService.createAnnouncement));

//all announcement of class
router.get("/getAllClassAnnouncements/:id", [auth], asyncMiddleware(announcementService.getAllClassAnnouncements));


router.get("/getAnnouncement/:id", [auth], asyncMiddleware(announcementService.getAnnouncement));
router.patch("/updateAnnouncement/:id", [auth, faculty], asyncMiddleware(announcementService.updateAnnouncement));
router.delete("/deleteAnnouncement/:id", [auth, faculty], asyncMiddleware(announcementService.deleteAnnouncement));

module.exports = router;