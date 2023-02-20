const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  name: {
    type: String,
    //required: true,
    unique: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Type.Object.Id,
    ref: "User",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid user id!`,
    },
  },
  dateUploaded: {
    type: Date,
    required: true,
    default: Date.now,
  },
  fileSize: {
    type: Number,
    required: true,
  },
  fileType: {
    type: String,
    required: true,
  },
  file: {
    type: Buffer,
    required: true,
  },
});

const Resource = mongoose.model("Resource", resourceSchema);

module.exports = Resource;
