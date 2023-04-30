require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const methodOverride = require("method-override");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const programRouter = require("./routes/program");
const courseRouter = require("./routes/course");
const classRouter = require("./routes/class");
const channelRouter = require("./routes/channel");
const announcementRouter = require("./routes/announcement");
const attendanceRouter = require("./routes/attendance");
const semesterRouter = require("./routes/semester");
const assignmentRouter = require("./routes/assignment");
const quizRouter = require("./routes/quiz");
const questionRouter = require("./routes/question");
const answerRouter = require("./routes/answer");
const submissionRouter = require("./routes/submission");
const generalRouter = require("./routes/general");
const notificationRouter = require("./routes/notification");

const connectDB = require("./config/db");
const wss = require("./websocket/websocketServer");
const http = require("http");


const app = express();
const server = http.createServer(app);

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

app.use(bodyParser.urlencoded({ extended: true, limit: "16mb" }));
app.use(bodyParser.json({ limit: "16mb" }));
app.use(bodyParser.raw({ limit: "16mb" }));

app.use("/admin", adminRouter);
app.use("/auth", authRouter);
app.use("/program", programRouter);
app.use("/course", courseRouter);
app.use("/class", classRouter);
app.use("/channel", channelRouter);
app.use("/announcement", announcementRouter);
app.use("/attendance", attendanceRouter);
app.use("/semester", semesterRouter);
app.use("/assignment", assignmentRouter);
app.use("/quiz", [quizRouter, submissionRouter]);
app.use("/question", questionRouter);
app.use("/answer", answerRouter);
app.use("/general", generalRouter);
app.use("/notification", notificationRouter);

app.use(error);

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});


// app.listen(PORT, () => {
//   console.log(`Server is running on ${PORT}...`);
// });



