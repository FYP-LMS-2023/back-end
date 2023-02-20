const mongoose = require("mongoose");
const Assignment = require("./Assignment");
const Quiz = require("./Quiz");

const submissionSchema = new mongoose.Schema({
  studentID: {
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
  submissionText: {
    type: String,
    //required: true,
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
  marksRecieved: {
    type: Number,
    required: true,
    default: 0,
  },
  dateSubmitted: {
    type: Date,
    required: true,
    default: Date.now,
  },
  referringTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    validate: {
      validator: function (v) {
        return mongoose.Types.ObjectId.isValid(v);
      },
    },
    message: (props) => `${props.value} is not a valid referrence id!`,
  },
  submissionFor: {
    type: String,
    required: true,
    enum: ["Assignment", "Quiz"],
  },
  submissionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  submissionStatus: {
    type: String,
    required: true,
    enum: ["submitted", "resubmitted", "returned"],
    default: "submitted",
  },
  submissionNumber: {
    type: Number,
    required: true,
    default: 1,
  },
  submissionReturned: [
    {
      comment: {
        type: String,
        required: true,
      },
      commentedBy: {
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
      dateCommented: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
  ],
  submissionGrade: {
    type: Number,
    required: true,
    default: 0,
  },
});

//write a pre save hook to toggle enum status of submissionFor to 'Assignment' or 'Quiz' based on the type of the referringTo object
submissionSchema.pre("save", function (next) {
  if (this.referringTo instanceof Assignment) {
    this.submissionFor = "Assignment";
  } else if (this.referringTo instanceof Quiz) {
    this.submissionFor = "Quiz";
  }
  next();
});

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
