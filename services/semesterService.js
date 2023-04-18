
const { Semester, validateSemester } = require("../models/Semester.js");

exports.createSemester = async (req, res, next) => {
    var schema = {
      semesterName: req.body.semesterName,
      semesterStartDate: req.body.semesterStartDate,
      semesterEndDate: req.body.semesterEndDate,
    };
  
    const { error } = validateSemester(schema, res);
    if (error) {
      console.log("validation error");
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    let semester = new Semester(schema);
    const result = await semester.save();
  
    if (result) {
      res.status(200).send({
        message: "Semester created successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error creating semester",
      });
    }
  };
  