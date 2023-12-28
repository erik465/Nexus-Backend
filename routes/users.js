const express = require("express");
const User = require("../schemas/user");
const { authMiddleware } = require("../middleware/validation");

const usersRouter = express.Router();

usersRouter.get("/current", authMiddleware, async (req, res, next) => {
  try {
    const currentUserID = req.user.id;

    const currentUser = await User.findById(currentUserID);

    res.json(currentUser);
  } catch (e) {
    return next(e);
  }
});

module.exports = usersRouter;
