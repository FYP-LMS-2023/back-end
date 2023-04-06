const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)
require("dotenv").config();

const threadSchema = new mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validator: function (v) {
      return mongoose.Types.ObjectId.isValid(v);
    },
    message: (props) => `${props.value} is not a valid user id!`,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  datePosted: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
      },
      message: (props) => `${props.value} is not a valid comment id!`,
    },
  ],
  //more flexible if you want to add more properties to the tags items in the future. For example, you might want to include a description property for each tag, or a color property to use for styling purposes
  tags: {
    type: [
      {
        type: String,
        enum: ["General", "Homework", "Project", "Exam", "Question", "Other"],
      },
    ],
    required: true,
    default: ["General"],
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0,
  },
});

const Thread = new mongoose.model("Thread", threadSchema);

function validateThread(thread) {
  var schema = Joi.object({
    postedBy: Joi.objectId().required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(255).required(),
    comments: Joi.array().items(Joi.objectId()).required(),
    tags: Joi.array().items(Joi.string().valid("General", "Homework", "Project", "Exam", "Question", "Other")).default(["General"]).required(),
  });
  return schema.validate(thread);
}

module.exports = {
  Thread,
  validateThread
}