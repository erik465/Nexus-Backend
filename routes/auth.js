require("dotenv").config();
const express = require("express");
const authRouter = express.Router();

const User = require("../schemas/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const {
  validateRegistration,
  validateLogin,
  authMiddleware,
} = require("../middleware/validation");

authRouter.post("/register", validateRegistration, async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const createdUser = await User.create({
      username: req.body.username,
      password: hashedPassword,
      email: req.body.email,
      fitnessGoal: req.body.fitnessGoal || null,
      token: "",
    });

    createdUser.token = jwt.sign(
      { _id: createdUser._id },
      process.env.JWT_SECRET_KEY,
      {
        expiresIn: "24h",
      }
    );

    return res.status(201).json({
      Status: "201 Created",
      data: { user: createdUser },
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post("/login", validateLogin, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "24h",
    });

    await User.findByIdAndUpdate(user._id, { token });

    res.json({
      Status: "200 OK",
      data: {
        token: token,
        user,
      },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { token: null });
    res.status(204).send({
      Status: "204 No Content",
    });
  } catch (e) {
    return next(e);
  }
});

module.exports = authRouter;
