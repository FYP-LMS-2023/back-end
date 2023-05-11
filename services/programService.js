
const {Program, validateProgram} = require("../models/Program");


exports.createProgram = async (req, res, next) => {
    var schema = {
      name: req.body.name,
      code: req.body.code,
      description: req.body.description,
      electives: req.body.electives,
      cores: req.body.cores,
      faculty: req.body.faculty
    }
  
    const {error} = validateProgram(schema)
    
    if (error)
      return res.status(400).send({ message: `${error.details[0].message}` });
  
    const checkName = await Program.find({name: req.body.name})
    if(checkName.length) return res.status(400).send({ message: "Program with name already exists!"})
  
    const checkCode = await Program.find({code: req.body.code})
    if(checkCode.length) return res.status(400).send({ message: "Program with code already exists!"})
  
    const program = new Program(schema);
  
    const result = await program.save();
  
    if (result) {
      res.status(200).send(
        result
      );
    } else {
      res.status(500).send({
        mssg: "error creating program!"
      });
    }
  };


exports.getProgram = async (req, res, next) => {
  const {id} = req.params;
  if (!id) {
    res.status(400).send({
      message: "id is required!"
    });   
  }
  const program = await Program.findById(id).populate({
    path: "faculty",
    select: "fullName email ERP profilePic"
  });

  if (!program) {
    res.status(400).send({
      message: "program doesn't exist!"
    });   
  }
  res.status(200).send(program);
}

exports.getAllPrograms = async (req, res, next) => {
  const programs = await Program.find().populate({
    path: "faculty",
    select: "fullName email ERP profilePic"
  });

  if (!programs) {
    res.status(400).send({
      message: "No programs exist!"
    });   
  }
  res.status(200).send(programs);
}