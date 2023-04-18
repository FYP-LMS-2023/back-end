require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const programRouter = require("./routes/program");
const courseRouter = require("./routes/course");
const classRouter = require("./routes/class");
const channelRouter = require("./routes/channel");
const announcementRouter = require("./routes/announcement");
const attendanceRouter = require("./routes/attendance");
const semesterRouter = require("./routes/semester")


const connectDB = require("./config/db");

const app = express();

if (!process.env.jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined");
  process.exit(1);
}

if (!process.env.PORT) {
  console.error("FATAL ERROR: PORT is not defined");
  process.exit(1);
}

connectDB();
app.use(cors());

if (app.get("env") === "development") {
  app.use(morgan());
  console.log("Morgan logging enabled...");
}

app.use(express.json());
app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/program", programRouter);
app.use("/course", courseRouter);
app.use("/class", classRouter);
app.use("/channel", channelRouter);
app.use("/announcement", announcementRouter);
app.use("/attendance", attendanceRouter);
app.use("/semester", semesterRouter)
app.use(error);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});
