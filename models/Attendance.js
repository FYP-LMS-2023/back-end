const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  classID: {
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
            required: true,
            validate: {
              validator: function (v) {
                return mongoose.Types.ObjectId.isValid(v);
              },
            },
            message: (props) => `${props.value} is not a valid user id!`,
          },
          present: {
            type: Boolean,
            required: true,
            default: true,
          },
        },
      ],
    },
  ],
});
