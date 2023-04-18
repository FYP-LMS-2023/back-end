const {
    Announcement,
    validateAnnouncement,
  } = require("../models/Announcement.js");

const { User } = require("../models/User.js");

exports.createAnnouncement = async (req, res, next) => {
    var schema = {
      title: req.body.title,
      description: req.body.description,
      datePosted: req.body.datePosted,
      postedBy: req.body.postedBy,
    };
  
    const user = await User.findById(req.body.postedBy);
  
    if (!user) {
      return res.status(400).send({ message: "User does not exist!" });
    }
  
    const { error } = validateAnnouncement(schema, res);
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let announcement = new Announcement(schema);
    const result = await announcement.save();
  
    var populatedResult = await result.populate("postedBy", "fullName ERP -_id");
  
    if (populatedResult) {
      res.status(200).send({
        message: "Announcement created successfully!",
        populatedResult,
      });
    } else {
      res.status(500).send({
        message: "Error creating announcement",
      });
    }
  };
  