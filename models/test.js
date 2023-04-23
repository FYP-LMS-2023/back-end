const mongoose = require("mongoose");
const Joi = require("joi");
require("dotenv").config();

const testSchema = new mongoose.Schema({
  file: {
    type: Buffer,
    required: true,
  },
});
const Test = mongoose.model("Test", testSchema);

module.exports = Test;
