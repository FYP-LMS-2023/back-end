require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
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
app.use("/auth", authRouter);
app.use(error);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});
