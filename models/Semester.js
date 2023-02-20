const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  semesterName: {
    type: String,
    required: true,
    unique: true,
    validator: {
      validator: function (v) {
        return /^(SUMMER|FALL|SPRING)\s\d{4}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid semester name!`,
    },
  },
  semesterStartDate: {
    type: Date,
    required: true,
  },
  semesterEndDate: {
    type: Date,
    required: true,
  },
});

const Semester = mongoose.model("Semester", semesterSchema);

module.exports = Semester;
