const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();


const resourceSchema = new mongoose.Schema({
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
  fileName: {
    type: String,
    required: true,
  }
});

const Resource = mongoose.model("Resource", resourceSchema);

function validateResource(resource){
  var schema = Joi.object({
    uploadedBy: Joi.objectId().required(),
    dateUploaded: Joi.date().required(),
    fileSize: Joi.number().min(0).required(),
    fileType: Joi.string().min(5).max(255).required(),
    file: Joi.binary().required(),
    fileName: Joi.string().min(5).max(255).required(),
  });

  return schema.validate(resource);
}

module.exports = {
  Resource,
  validateResource,  
}
