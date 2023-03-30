const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");

router.get("/test", asyncMiddleware(authService.test));
router.post("/createUser", asyncMiddleware(authService.createUser));
router.post("/createProgram", asyncMiddleware(authService.createProgram));
module.exports = router;
