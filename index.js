const express = require("express");
const error = require("./middlewares/errors");
const authRouter = require("./routes/auth");
const connectDB = require("./config/db");


const app = express();


connectDB();

app.use("/auth", authRouter);
app.use(error);
