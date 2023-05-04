const express = require("express");
const router = express.Router();
const resourceService = require("../services/resourceService");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const auth = require("../middlewares/auth");
const faculty = require("../middlewares/faculty");
const { uploadAssignment, uploadSubmission, uploadResource } = require("../middlewares/upload");

router.post("/uploadResource", [auth, faculty, uploadResource.array("files")], asyncMiddleware(resourceService.createResource));

router.patch("/deleteResource/:id", [auth, faculty ], asyncMiddleware(resourceService.deleteResource));

router.get("/getClassResources/:id", [auth], asyncMiddleware(resourceService.getClassResources));
module.exports = router;