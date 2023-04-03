const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const announcementSchema = new mongoos.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid user id!`,
    },
  },
  datePosted: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const Announcement = mongoose.model("Announcement", announcementSchema);


//validate announcement using joi
function validateAnnouncement(announcement) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    userId: Joi.objectId().required(),
    datePosted: Joi.date().required(),
  });
  return schema.validate(announcement)
}


module.exports = {
  Announcement,
  validateAnnouncement,
}