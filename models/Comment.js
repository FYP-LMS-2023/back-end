const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();


const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: mongoose.Schema.Types.OBjectId,
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
    default: Date.now,
  },
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid comment id!`,
      },
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
    comment: Joi.string().required(),
    author: Joi.ObjectId().required(),
    datePosted: Joi.date(),
    replies: Joi.array().items(Joi.ObjectId()),
  });
  return schema.validate(comment);
}

module.exports = {
  Comment,
  validateComment
}
