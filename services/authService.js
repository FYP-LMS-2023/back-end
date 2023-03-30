const Program = require("../models/Program");

exports.test = (req, res, next) => {
  res.send("Test");
};

exports.createProgram = async (req, res, next) => {
  const program = new Program({
    name: "Bachelors Of Science in Computer Science",
    code: "BSCS",
    description:
      "The Department of Computer Science is one of the two departments at the School of Mathematics and Computer Science (SMCS) at the Institute of Business Administration (IBA) Karachi. The department offers bachelor, master and doctoral degree programs in Computer Science. The department has recently launched a long-awaited master's program in Data Science.",
    electives: [],
    cores: [],
    faculty: [],
  });

  const result = await program.save();

  if (result) {
    res.status(200).send({
      result,
    });
  } else {
    res.status(400).send({
      mssg: "error!"
    })
  }
};
