const express = require("express");
const router = express.Router();
const authService = require("../services/authService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");

router.get("test", asyncMiddleware(authService.test));

module.exports = router;
