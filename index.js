const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
const connectDB = require("./config/db");

const app = express();

connectDB();
app.use(cors());
app.use(morgan());

app.use("/auth", authRouter);
app.use(error);

app.listen(8080, () => {
  console.log("Server is on!");
});
