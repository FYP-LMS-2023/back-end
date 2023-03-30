const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
const connectDB = require("./config/db");

const app = express();

connectDB();
app.use(cors());

if (app.get("env") === "development") {
  app.use(morgan());
  console.log("Morgan logging enabled...");
}
app.use("/auth", authRouter);
app.use(error);

app.use("/createUser", authRouter);
app.use(error);


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}...`);
});


