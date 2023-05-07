const {
    Course,
    validateCourse,
    validateCourseUpdate,
  } = require("../models/Course.js");

  const { Program } = require("../models/Program.js");
  
  
  exports.createCourse = async (req, res, next) => {
    const { error } = validateCourse({
      courseName: req.body.courseName,
      courseCode: req.body.courseCode,
      courseDescription: req.body.courseDescription,
      creditHours: req.body.creditHours,
      classes:[],
    });

    if (error) {
      return res.status(400).send({ message: `${error.details[0].message}` });
    }

    if(!req.body.programID) {
      return res.status(400).send({ message: "Program is required!" });
    }

    
  
    let course = new Course({
      courseName: req.body.courseName,
      courseCode: req.body.courseCode,
      courseDescription: req.body.courseDescription,
      creditHours: req.body.creditHours,
      classes: [],
    });
  
    const result = await course.save();

    var program = await Program.findById(req.body.programID);
    if(!program) return res.status(400).send({ message: "Program does not exist!"});

    program.cores.push(result._id);
    await program.save();

    if (result) {
      res.status(200).send({
        message: "Course created successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error creating course",
      });
    }
  };
  
  exports.getCourse = async (req, res, next) => {
    const { id } = req.params;
    let course;
    if (id.length === 24) {
      course = await Course.findById(req.params.id);
    } else {
      course = await Course.findOne({ courseCode: req.params.id });
    }
  
    if (!course) {
      return res.status(400).send({ message: "Course does not exist!" });
    }
    res.status(200).send(course);
  };
  
  exports.getAllCourses = async (req, res, next) => {
    const courses = await Course.find();
    if (!courses) {
      return res.status(400).send({ message: "No courses found!" });
    }
    res.status(200).send(courses);
  };
  
  exports.updateCourse = async (req, res, next) => {
    const { error } = validateCourseUpdate(req.body);
    if (error) {
      return res.status(400).send({ message: `${error.details[0].message}` });
    }
  
    const { id } = req.params;
    console.log(id)
    let course = await Course.findById(id);
    if (!course) {
      return res.status(400).send({ message: "Course does not exist!" });
    }
  
    if (req.body.courseName) {
      course.courseName = req.body.courseName;
    }
    if (req.body.courseDescription) {
      course.courseDescription = req.body.courseDescription;
    }
    if (req.body.creditHours) {
      course.creditHours = req.body.creditHours;
    }
  
    const result = await course.save();
    if (result) {
      res.status(200).send({
        message: "Course updated successfully!",
        result,
      });
    } else {
      res.status(500).send({
        message: "Error updating course",
      });
    }
  };