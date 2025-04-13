const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please add a title"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
    category: {
      type: String,
      required: [true, "Please add a category"],
      enum: ["Design", "Coding", "Tutoring", "Other"],
    },
    location: {
      type: String,
      required: [true, "Please add a location"],
    },
    credits: {
      type: Number,
      required: [true, "Please add credits"],
      min: [1, "Credits must be at least 1"],
    },
    status: {
      type: String,
      enum: ["open", "in progress", "completed", "cancelled"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    applicants: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        message: String,
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Task", taskSchema)
