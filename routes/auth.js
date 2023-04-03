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

module.exports = router;
