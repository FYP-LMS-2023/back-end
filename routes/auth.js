const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const admin = require("../middlewares/admin")

router.post("/test", asyncMiddleware(authService.test));
router.post("/createUser", [auth , admin], asyncMiddleware(authService.createUser));
router.post("/login", asyncMiddleware(authService.login));
router.get("/getProfile", auth, asyncMiddleware(authService.getProfile));
router.get("/getPopulatedProfile/:id", auth, asyncMiddleware(authService.getPopulatedProfile));

module.exports = router;
