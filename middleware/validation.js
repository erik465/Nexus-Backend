require("dotenv").config();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../schemas/user");

const validateId = (req, res, next) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  next();
};

const validateRegistration = async (req, res, next) => {
  const { username, email, password, fitnessGoal } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    return res.status(409).json({
      Status: "409 Conflict",
      Message: `User with email ${user.email} already exists`,
    });
  }

  const userWUsername = await User.findOne({ username });
  if (userWUsername) {
    return res.status(409).json({
      Status: "409 Conflict",
      Message: `User with username ${userWUSername.username} already exists`,
    });
  }

  if (!username || !email || !password) {
    return res.status(400).json({
      Status: "400 Bad Request",
      message: "Bad Request: Missing required fields",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ message: "Bad Request: Invalid email format" });
  }

  next();
};

const validateLogin = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      Status: "400 Bad Request",
      Message: `Missing required fields`,
    });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Email or password is wrong",
      },
    });
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Email or password is wrong",
      },
    });
  }
  next();
};

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Not authorized",
      },
    });
  }

  const [bearer, token] = authHeader.split(" ", 2);

  if (bearer !== "Bearer") {
    return res.status(401).json({
      Status: "401 Unauthorized",
      ResponseBody: {
        message: "Not authorized",
      },
    });
  }

  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decode) => {
    if (err) {
      return res.status(401).json({
        Status: "401 Unauthorized",
        ResponseBody: {
          message: "Invalid Token",
        },
      });
    }
    req.user = decode;
  });
  next();
};

module.exports = {
  validateId,
  validateRegistration,
  validateLogin,
  authMiddleware,
};
