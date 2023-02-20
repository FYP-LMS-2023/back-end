const mongoose = require("mongoose");

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

module.exports = Channel;
