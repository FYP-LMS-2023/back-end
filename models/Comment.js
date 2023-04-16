const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require('joi-objectid')(Joi)
require("dotenv").config();


const commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true,
  },
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
  datePosted: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      userID: {
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
      repliedComment: {
        type: String,
        required: true,
      },
      datePosted: {
        type: Date,
        default: Date.now,
      }
    },
  ],
});

const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
    comment: Joi.string().required(),
    postedBy: Joi.objectId().required(),
    replies: Joi.array().items(
      Joi.object({
        userID: Joi.objectId().required(),
        repliedComment: Joi.string().required()
      })
    ),
  });
  return schema.validate(comment);
}

module.exports = {
  Comment,
  validateComment
}
