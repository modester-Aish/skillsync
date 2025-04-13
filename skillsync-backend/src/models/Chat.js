const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
})

const chatSchema = new mongoose.Schema(
  {
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    messages: [messageSchema],
    lastMessage: {
      content: String,
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      timestamp: Date,
    },
    // Optional reference to a task if the conversation is related to a specific task
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
    },
  },
  {
    timestamps: true,
  },
)

module.exports = mongoose.model("Chat", chatSchema)
