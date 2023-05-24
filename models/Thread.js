const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
require("dotenv").config();

const { User } = require("./User");
const { Comment } = require("./Comment");

const threadSchema = new mongoose.Schema({
  postedBy: {
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
  title: {
    type: String,
    required: true,
    minlength: [1, "Thread title must have a minimum length of 5 characters."],
    maxlength: [255, "Thread title must not exceed 255 characters."],
    // validate: {
    //   validator: function (value) {
    //     // Check if the value does not consist only of white space characters
    //     return /^\s*$/.test(value) === false;
    //   },
    //   message: "Only white space characters are not allowed.",
    // },
  },
  description: {
    type: String,
    required: true,
    // validate: {
    //   validator: function (value) {
    //     // Check if the value contains only white space characters
    //     return !/^\s*$/.test(value);
    //   },
    //   message: "Only white space characters are not allowed.",
    // },
    minlength: [
      1,
      "Thread description must have a minimum length of 5 characters.",
    ],
    maxlength: [4096, "Thread description must not exceed 4096 characters."],
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
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

threadSchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});

threadSchema.virtual("downvoteCount").get(function () {
  return this.downvotes.length;
});

threadSchema.set("toJSON", { virtuals: true });
threadSchema.set("toObject", { virtuals: true });

const Thread = new mongoose.model("Thread", threadSchema);

function validateThread(thread) {
  var schema = Joi.object({
    postedBy: Joi.objectId().required(),
    title: Joi.string().min(5).max(128).required(),
    description: Joi.string().min(5).max(1024).required(),
    comments: Joi.array().items(Joi.objectId()).required(),
    tags: Joi.array()
      .items(
        Joi.string().valid(
          "General",
          "Homework",
          "Project",
          "Exam",
          "Question",
          "Other"
        )
      )
      .default(["General"])
      .required(),
    upvotes: Joi.array().items(Joi.objectId()).optional(),
    downvotes: Joi.array().items(Joi.objectId()).optional(),
  });
  return schema.validate(thread);
}

module.exports = {
  Thread,
  validateThread,
};
