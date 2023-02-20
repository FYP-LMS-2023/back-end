const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    require: true,
    validtor: function (v) {
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

module.exports = mongoose.model("Thread", threadSchema);

const mongoose = require("mongoose");
