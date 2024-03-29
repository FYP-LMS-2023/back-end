const mongoose = require("mongoose");
const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);
require("dotenv").config();

const replySchema = new mongoose.Schema({
  reply: {
    type: String,
    required: true,
    minlength: [1, "Comment must have a minimum length of 5 characters."],
    maxlength: [4096, "Comment must not exceed 4096 characters."],
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid user id!`,
  },
  datePosted: {
    type: Date,
    default: Date.now,
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
  deleteFlag: {
    type: Boolean,
    default: false,
  },
});

replySchema.virtual("upvoteCount").get(function () {
  return this.upvotes.length;
});

replySchema.virtual("downvoteCount").get(function () {
  return this.downvotes.length;
});

replySchema.set("toJSON", { virtuals: true });
replySchema.set("toObject", { virtuals: true });

const Reply = mongoose.model("Reply", replySchema);

function validateReply(reply) {
  const schema = Joi.object({
    reply: Joi.string().required(),
    postedBy: Joi.objectId().required(),
    upvotes: Joi.array().items(Joi.objectId()).optional(),
    downvotes: Joi.array().items(Joi.objectId()).optional(),
  });
  return schema.validate(reply);
}

module.exports = {
  Reply,
  validateReply,
};
