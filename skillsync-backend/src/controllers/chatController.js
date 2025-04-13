const Chat = require("../models/Chat")
const User = require("../models/userModel")
const mongoose = require("mongoose")

// @desc    Get all conversations for the current user
// @route   GET /api/chat/conversations
// @access  Private
exports.getConversations = async (req, res) => {
  try {
    // Find all conversations where the current user is a participant
    const conversations = await Chat.find({
      users: { $in: [req.user.id] },
    })
      .populate("users", "name email avatar")
      .sort({ updatedAt: -1 })

    // Calculate unread messages count for each conversation
    const conversationsWithUnread = conversations.map((conversation) => {
      // Count messages that are unread and not sent by the current user
      const unreadCount = conversation.messages.filter(
        (message) => !message.read && message.sender.toString() !== req.user.id,
      ).length

      // Convert to plain object to add unreadCount
      const conversationObj = conversation.toObject()
      conversationObj.unreadCount = unreadCount

      return conversationObj
    })

    res.json(conversationsWithUnread)
  } catch (error) {
    console.error("Error fetching conversations:", error)
    res.status(500).json({
      message: "Server error while fetching conversations",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get messages for a specific conversation
// @route   GET /api/chat/messages/:conversationId
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" })
    }

    // Find the conversation
    const conversation = await Chat.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Check if user is a participant
    if (!conversation.users.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to access this conversation" })
    }

    // Mark messages as read
    await Chat.updateMany(
      {
        _id: conversationId,
        "messages.sender": { $ne: req.user.id },
        "messages.read": false,
      },
      {
        $set: { "messages.$[elem].read": true },
      },
      {
        arrayFilters: [{ "elem.sender": { $ne: req.user.id }, "elem.read": false }],
      },
    )

    // Return messages
    res.json(conversation.messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({
      message: "Server error while fetching messages",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Send a new message
// @route   POST /api/chat/messages
// @access  Private
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body

    if (!conversationId || !content) {
      return res.status(400).json({ message: "Please provide conversationId and content" })
    }

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" })
    }

    // Find the conversation
    const conversation = await Chat.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Check if user is a participant
    if (!conversation.users.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to send messages in this conversation" })
    }

    // Create new message
    const newMessage = {
      sender: req.user.id,
      content,
      timestamp: new Date(),
      read: false,
    }

    // Add message to conversation
    conversation.messages.push(newMessage)

    // Update lastMessage
    conversation.lastMessage = {
      content,
      sender: req.user.id,
      timestamp: new Date(),
    }

    await conversation.save()

    // Return the new message
    res.status(201).json(newMessage)
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({
      message: "Server error while sending message",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Create a new conversation
// @route   POST /api/chat/conversations
// @access  Private
exports.createConversation = async (req, res) => {
  try {
    const { userId, taskId } = req.body

    if (!userId) {
      return res.status(400).json({ message: "Please provide userId" })
    }

    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" })
    }

    // Check if user exists
    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if conversation already exists
    const existingConversation = await Chat.findOne({
      users: { $all: [req.user.id, userId] },
      ...(taskId ? { task: taskId } : {}),
    })

    if (existingConversation) {
      return res.json(existingConversation)
    }

    // Create new conversation
    const newConversation = new Chat({
      users: [req.user.id, userId],
      messages: [],
      ...(taskId ? { task: taskId } : {}),
    })

    await newConversation.save()

    // Populate users
    const populatedConversation = await Chat.findById(newConversation._id).populate("users", "name email avatar")

    res.status(201).json(populatedConversation)
  } catch (error) {
    console.error("Error creating conversation:", error)
    res.status(500).json({
      message: "Server error while creating conversation",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Mark conversation as read
// @route   PUT /api/chat/conversations/:conversationId/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params

    // Validate conversationId
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(400).json({ message: "Invalid conversation ID" })
    }

    // Find the conversation
    const conversation = await Chat.findById(conversationId)

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" })
    }

    // Check if user is a participant
    if (!conversation.users.includes(req.user.id)) {
      return res.status(403).json({ message: "Not authorized to access this conversation" })
    }

    // Mark messages as read
    await Chat.updateMany(
      {
        _id: conversationId,
        "messages.sender": { $ne: req.user.id },
        "messages.read": false,
      },
      {
        $set: { "messages.$[elem].read": true },
      },
      {
        arrayFilters: [{ "elem.sender": { $ne: req.user.id }, "elem.read": false }],
      },
    )

    res.json({ message: "Messages marked as read" })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    res.status(500).json({
      message: "Server error while marking messages as read",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
