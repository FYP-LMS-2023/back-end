const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)
require("dotenv").config();
const { Classes } = require("./Class");


const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  announcementType: {
    type: String,
    enum: ['general', 'course', 'quiz', 'assignment', 'exam'],
    default: 'general',
  }
});

const Announcement = mongoose.model("Announcement", announcementSchema);


//validate announcement using joi
function validateAnnouncement(announcement) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).required(),
    description: Joi.string().min(5).max(255).required(),
    postedBy: Joi.objectId().required(),
    datePosted: Joi.date().required(),
    announcementType: Joi.string().valid('general', 'course', 'quiz', 'assignment', 'exam').required(),
  });
  return schema.validate(announcement)
}

function validateAnnouncementUpdate(announcement) {
  var schema = Joi.object({
    title: Joi.string().min(5).max(50).optional(),
    description: Joi.string().min(5).max(255).optional(),
    announcementType: Joi.string().valid('general', 'course', 'quiz', 'assignment', 'exam').optional(),
  }).min(1); // require at least one field to be present
  return schema.validate(announcement)
}

module.exports = {
  Announcement,
  validateAnnouncement,
  validateAnnouncementUpdate,
}