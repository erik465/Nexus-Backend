require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const db_connection = require("./database/connection");

db_connection(process.env.DB_URI, app);

const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");

app.use("/auth", authRouter);
app.use("/user", usersRouter);

app.use((__, res, _) => {
  res.status(404).json({
    status: "error",
    code: 404,
    message: "Not found",
  });
});

app.use((err, req, res, next) => {
  res.status(500).json({
    message: err.message,
    code: 500,
    status: "Internal Server Error",
  });
});

module.exports = app;
