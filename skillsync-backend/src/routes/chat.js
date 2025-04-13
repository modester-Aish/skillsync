const express = require("express")
const router = express.Router()
const chatController = require("../controllers/chatController")
const authMiddleware = require("../middleware/authMiddleware")

// Protect all chat routes
router.use(authMiddleware)

// Get all conversations for the current user
router.get("/conversations", chatController.getConversations)

// Get messages for a specific conversation
router.get("/messages/:conversationId", chatController.getMessages)

// Send a new message
router.post("/messages", chatController.sendMessage)

// Create a new conversation
router.post("/conversations", chatController.createConversation)

// Mark conversation as read
router.put("/conversations/:conversationId/read", chatController.markAsRead)

module.exports = router
