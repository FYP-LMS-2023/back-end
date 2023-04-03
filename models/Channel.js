const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();


const channelSchema = new mongoose.Schema({
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid thread id!`,
      },
    },
  ],
});

const Channel = mongoose.model("Channel", channelSchema);

function validateChannel(channel) {
    var schema = Joi.object({
    threads: Joi.array().items(Joi.objectId()),
  });

  return schema.validate(channel);
}

module.exports = {
  Channel,
  validateChannel,
}
