const express = require("express");
const router = express.Router();
const notificationService = require("../services/notificationService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");


router.get("/getUnreadNotifications", auth, asyncMiddleware(notificationService.getUnreadNotifications));
router.patch("/markNotificationAsRead/:id", auth, asyncMiddleware(notificationService.markNotificationAsRead));
router.get("/getReadNotifications", auth, asyncMiddleware(notificationService.getReadNotifications));

module.exports = router;
