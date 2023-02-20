const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  uploadDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
      message: (props) => `${props.value} is not a valid class id!`,
    },
  },
  resubmissionsAllowed: {
    type: Number,
    required: true,
    default: 0,
  },
  status: {
    type: String,
    required: true,
    enum: ["open", "closed"],
    default: "open",
  },
  resubmissionDeadline: {
    type: Date,
  },
  description: {
    type: String,
    required: true,
  },
  attachments: [
    {
      filename: {
        type: String,
        required: true,
      },
      file: {
        type: Buffer,
        required: true,
      },
      fileSize: {
        type: Number,
        required: true,
      },
      fileType: {
        type: String,
        required: true,
      },
    },
  ],
  submissions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      required: true,
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: (props) => `${props.value} is not a valid submission id!`,
      },
    },
  ],
  marks: {
    type: Number,
    required: true,
    default: 0,
  },
});

// The pre-save middleware function checks whether the dueDate is in the past and sets the status field to 'late' if it is.
// When you create or update an Assignment document, Mongoose will automatically call the pre-save middleware function before
// saving the document to the database. This means that the status field will be set based on the dueDate field whenever an Assignment document is saved or updated
assignmentSchema.pre("save", function (next) {
  if (this.dueDate < new Date()) {
    this.status = "closed";
  } else {
    this.status = "open";
  }
  next();
});

const Assignment = mongoose.model("Assignment", assignmentSchema);

module.exports = Assignment;
