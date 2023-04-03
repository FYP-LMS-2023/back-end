const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const threadSchema = new mongoose.Schema({
  author: {
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
  date: {
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
    author: Joi.objectId().required(),
    title: Joi.string().min(5).max(255).required(),
    description: Joi.string().min(5).max(255).required(),
    date: Joi.date().required(),
    comments: Joi.array().required(),
    tags: Joi.array().required(),
    upvotes: Joi.number().min(0).required(),
  });
  return schema.validate(thread);
}

module.exports = {
  Thread,
  validateThread
}