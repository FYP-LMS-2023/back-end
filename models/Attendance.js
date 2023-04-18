const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const attendanceSchema = new mongoose.Schema({
  sessions: [
    {
      date: {
        type: Date,
        required: true,
      },
      attendance: [
        {
          studentID: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            //required: true,
            validate: {
              validator: function (v) {
                return mongoose.Types.ObjectId.isValid(v);
              },
            },
            message: (props) => `${props.value} is not a valid user id!`,
          },
          present: {
            type: Boolean,
            //required: true,
            default: true,
          },
        },
      ],
    },
  ],
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

function validateAttendance(attendance){
  var schema = Joi.object({
    //classID: Joi.string().required(),
    sessions: Joi.array().items(Joi.object({
      date: Joi.date().required(),
      attendance: Joi.array().items(Joi.object({
        studentID: Joi.objectId().required(),
        present: Joi.boolean().required(),
      }))
    }))
  })
  return schema.validate(attendance);
}

module.exports = {
  Attendance,
  validateAttendance,
}
