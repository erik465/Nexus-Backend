require("dotenv").config();
const mongoose = require("mongoose");

const fitnessGoalSchema = new mongoose.Schema({
  currentWeight: { type: Number, default: 0 },
  weightGoal: { type: Number, default: 0 },
  waterGoal: { type: Number, default: 0 },
  meditationGoal: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fitnessGoal: { type: fitnessGoalSchema, default: null },
  token: { type: String },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
