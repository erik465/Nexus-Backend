const express = require("express");
const User = require("../schemas/user");
const Event = require("../schemas/event");
const Task = require("../schemas/task");
const { authMiddleware } = require("../middleware/validation");

const usersRouter = express.Router();

//Current user

usersRouter.get("/current", authMiddleware, async (req, res, next) => {
  try {
    const currentUserID = req.user._id ? req.user._id : req.user.id;

    const currentUser = await User.findById(currentUserID);

    res.json(currentUser);
  } catch (e) {
    return next(e);
  }
});

//User's tasks operations

usersRouter.get("/tasks", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id ? req.user._id : req.user.id;
    const tasks = await Task.find({ owner: userId });

    res.status(200).json({
      Status: "200 OK",
      data: tasks,
    });
  } catch (error) {
    return next(error);
  }
});

usersRouter.post("/addTask", authMiddleware, async (req, res, next) => {
  try {
    const { title, description } = req.body;
    const newTask = await Task.create({
      owner: req.user.id,
      title,
      description,
    });
    res.json(newTask);
  } catch (error) {
    return next(error);
  }
});

usersRouter.put("/changeTask/:taskId", authMiddleware, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    const { title, description } = req.body;

    const updatedTask = await Task.findOneAndUpdate(
      { id: taskId, owner: req.user.id },
      { title, description },
      { new: true }
    );

    if (!updatedTask) {
      return res
        .status(404)
        .json({ messsage: "Task not found or unauthorized" });
    }

    res.json(updatedTask);
  } catch (error) {
    return next(error);
  }
});

usersRouter.patch(
  "/toggleCompleted/:taskId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const taskId = req.params.taskId;
      const task = await Task.findOne({ _id: taskId, owner: req.user.id });

      if (!task) {
        return res.status(404).json({ msg: "Task not found or unauthorized" });
      }

      task.completed = !task.completed;
      await task.save();

      res.json(task);
    } catch (error) {
      return next(error);
    }
  }
);

usersRouter.delete(
  "/deleteTask/:taskId",
  authMiddleware,
  async (req, res, next) => {
    try {
      const taskId = req.params.taskId;

      const deletedTask = await Task.findOneAndDelete({
        id: taskId,
        owner: req.user.id,
      });

      if (!deletedTask) {
        return res.status(404).json({ msg: "Task not found or unauthorized" });
      }

      res.json({ msg: "Task deleted successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

usersRouter.get("/events", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id ? req.user._id : req.user.id;
    const events = await Event.find({ owner: userId });

    res.status(200).json({
      Status: "200 OK",
      data: events,
    });
  } catch (error) {
    return next(error);
  }
});

usersRouter.post("/addEvent", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id ? req.user._id : req.user.id;
    const newEvent = await Event.create({
      title: req.body.title,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time,
      location: req.body.location,
      category: req.body.category,
      owner: userId,
    });
    res.status(201).json(newEvent);
  } catch (error) {
    return next(error);
  }
});

usersRouter.delete(
  "deleteEvent/:eventId",
  authMiddleware,
  async (req, res, res) => {
    try {
      const eventId = req.params.eventId;

      const deletedEvent = await Event.findOneAndDelete({
        id: eventId,
        owner: req.user.id,
      });

      if (!deletedEvent) {
        return res.status(404).json({ msg: "Event not found or unauthorized" });
      }

      res.json({ msg: "Event deleted successfully" });
    } catch (error) {
      return next(error);
    }
  }
);

usersRouter.put("/changeEvent/:eventId", async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.eventId, req.body, {
      new: true,
    });
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.status(200).json(event);
  } catch (error) {
    return next(error);
  }
});
module.exports = usersRouter;
