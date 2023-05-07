
const { Semester, validateSemester } = require("../models/Semester.js");
const moment = require("moment");

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

exports.getSemesters = async (req, res, next) => {
  const semesters = await Semester.find();
    const formattedSemesters = semesters.map((semester) => {
      const formattedStartDate = moment(semester.semesterStartDate).format('DD/MM/YYYY');
      const formattedEndDate = moment(semester.semesterEndDate).format('DD/MM/YYYY');
      const semesterStartDay = moment(semester.semesterStartDate).format('dddd');
      const semesterEndDay = moment(semester.semesterEndDate).format('dddd');
      const semesterStartMonth = moment(semester.semesterStartDate).format('MMMM');
      const semesterEndMonth = moment(semester.semesterEndDate).format('MMMM');
      return {
        semesterName: semester.semesterName,
        semesterStartDate: formattedStartDate,
        semesterEndDate: formattedEndDate,
        semesterStartDay,
        semesterEndDay,
        semesterStartMonth,
        semesterEndMonth,
      };
    });
  
    if (!semesters) {
      return res.status(400).send({ message: "No semesters found!" });
    }
    res.status(200).send(formattedSemesters);
};
  