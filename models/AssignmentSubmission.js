const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();
Joi.objectId = require("joi-objectid")(Joi);

const assignmentSubmissionSchema = new mongoose.Schema({
    uploadDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    files: [
        {
            url: {
                type: String,
                required: true
            },
            public_id: {
                type: String,
                required: true
            }
        }
    ],
    marksReceived: {
        type: Number,
        default: 0
    },
    submissionDescription: {
        type: String,
        required: true,
        default: "No description provided"
    },
    submissionNumber: {
        type: Number,
        required: true,
        default: 0
    },
    studentID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        validate: {
            validator: function (v) {
                return mongoose.Types.ObjectId.isValid(v);
            }
        }
    },
    returned: {
        type: Boolean,
        default: false
    },
    returnDate: {
        type: Date,
        default: null
    },
    returnDescription:{
        type: String,
        default: " "
    }
})

const AssignmentSubmission = mongoose.model("AssignmentSubmission", assignmentSubmissionSchema);

function validateAssignmentSubmission(assignmentSubmission) {
    const schema = Joi.object({
        assignmentID: Joi.objectId().required(),
        submissionDescription: Joi.string().required(),
    })
    return schema.validate(assignmentSubmission);
}

module.exports = {
    AssignmentSubmission,
    validateAssignmentSubmission
};

