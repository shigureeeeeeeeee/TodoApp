// models/Todo.js
const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    task: {
      type: String,
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    memo: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
      },
    ],
    workTime: {
      type: Number,
      default: 25 * 60, // デフォルトで25分（秒単位）
    },
    breakTime: {
      type: Number,
      default: 5 * 60, // デフォルトで5分（秒単位）
    },
    currentTime: {
      type: Number,
      default: 25 * 60,
    },
    isBreak: {
      type: Boolean,
      default: false,
    },
    pomodorosCompleted: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Todo", todoSchema);
