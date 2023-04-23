const mongoose = require("mongoose");
const Grid = require("gridfs-stream");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      "mongodb+srv://saadKarim:admin123@massh.hk78ufw.mongodb.net/test"
    );
    // conn.once("open", () => {
    //   var GFS = Grid(conn.db, mongo);
    //   GFS.collection("uploads");
    // });
    console.log("MongoDB connected successfully =]");
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
