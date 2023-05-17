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
    type: mongoose.Schema.Types.ObjectId,
    ref: "Reply",
   }
  ],
  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ],
  downvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }
  ]
});

commentSchema.virtual('upvoteCount').get(function () {
  return this.upvotes.length;
});

commentSchema.virtual('downvoteCount').get(function () {
  return this.downvotes.length;
});

commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

const Comment = mongoose.model("Comment", commentSchema);

function validateComment(comment) {
  const schema = Joi.object({
    comment: Joi.string().required(),
    postedBy: Joi.objectId().required(),
    replies: Joi.array().items(Joi.objectId()),
    upvotes: Joi.array().items(Joi.objectId()),
    downvotes: Joi.array().items(Joi.objectId()),
  });
  return schema.validate(comment);
}

module.exports = {
  Comment,
  validateComment
}
