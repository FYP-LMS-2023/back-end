const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const resourceSchema = new mongoose.Schema({
  uploadedBy: {
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
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  title: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    default: "Untitled",
  },
  description: {
    type: String,
    //required: true,
    minlength: 5,
    maxlength: 4096,
  },
  files: [
    {
      url: {
        type: String,
        required: true,
      },
      public_id: {
        type: String,
        required: true,
      },
    },
  ],
});

// const resourceSchema = new mongoose.Schema({
//   uploadedBy: {
//     type: mongoose.Schema.Type.Object.Id,
//     ref: "User",
//     required: true,
//     validate: {
//       validator: function (v) {
//         return mongoose.Types.ObjectId.isValid(v);
//       },
//       message: (props) => `${props.value} is not a valid user id!`,
//     },
//   },
//   dateUploaded: {
//     type: Date,
//     required: true,
//     default: Date.now,
//   },
//   fileSize: {
//     type: Number,
//     required: true,
//   },
//   fileType: {
//     type: String,
//     required: true,
//   },
//   file: {
//     type: Buffer,
//     required: true,
//   },
//   fileName: {
//     type: String,
//     required: true,
//   }
// });

const Resource = mongoose.model("Resource", resourceSchema);

function validateResource(resource) {
  const schema = Joi.object({
    uploadDate: Joi.date(),
    title: Joi.string().required(),
    description: Joi.string(),
    previewName: Joi.string(),
    file: Joi.object({
      url: Joi.string().required(),
      public_id: Joi.string().required(),
    }).required(),
    teacherID: Joi.objectId().required(),
  });

  return schema.validate(resource);
}

module.exports = {
  Resource,
  validateResource,
};
