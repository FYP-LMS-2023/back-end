const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://saadKarim:admin123@massh.hk78ufw.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("MongoDB connected successfully =]");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
