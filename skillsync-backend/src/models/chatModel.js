const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

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
      createdAt: Date,
    },
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
