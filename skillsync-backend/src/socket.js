const socketIo = require("socket.io")
const Chat = require("./models/Chat")

let io

// Store connected users
const connectedUsers = new Map()

const initializeSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // Frontend URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id)

    // Get user ID from query params
    const userId = socket.handshake.query.userId
    if (userId) {
      // Store user connection
      connectedUsers.set(userId, socket.id)

      // Broadcast updated online users
      broadcastOnlineUsers()
    }

    // Handle sending messages
    socket.on("sendMessage", async (messageData) => {
      try {
        const { conversationId, sender, content, timestamp } = messageData

        // Find the conversation to get recipients
        const conversation = await Chat.findById(conversationId)
        if (!conversation) return

        // Find recipients (all users except sender)
        const recipients = conversation.users.filter((user) => user.toString() !== sender)

        // Emit message to all recipients who are online
        recipients.forEach((recipientId) => {
          const recipientSocketId = connectedUsers.get(recipientId.toString())
          if (recipientSocketId) {
            io.to(recipientSocketId).emit("getMessage", messageData)
          }
        })
      } catch (error) {
        console.error("Socket error sending message:", error)
      }
    })

    // Handle typing indicator
    socket.on("typing", (data) => {
      try {
        const { conversationId, userId } = data

        // Find the conversation to get recipients
        Chat.findById(conversationId)
          .then((conversation) => {
            if (!conversation) return

            // Find recipients (all users except the one typing)
            const recipients = conversation.users.filter((user) => user.toString() !== userId)

            // Emit typing event to all recipients who are online
            recipients.forEach((recipientId) => {
              const recipientSocketId = connectedUsers.get(recipientId.toString())
              if (recipientSocketId) {
                io.to(recipientSocketId).emit("typing", data)
              }
            })
          })
          .catch((error) => {
            console.error("Error finding conversation:", error)
          })
      } catch (error) {
        console.error("Socket error handling typing:", error)
      }
    })

    // Handle stop typing indicator
    socket.on("stopTyping", (data) => {
      try {
        const { conversationId, userId } = data

        // Find the conversation to get recipients
        Chat.findById(conversationId)
          .then((conversation) => {
            if (!conversation) return

            // Find recipients (all users except the one typing)
            const recipients = conversation.users.filter((user) => user.toString() !== userId)

            // Emit stop typing event to all recipients who are online
            recipients.forEach((recipientId) => {
              const recipientSocketId = connectedUsers.get(recipientId.toString())
              if (recipientSocketId) {
                io.to(recipientSocketId).emit("stopTyping", data)
              }
            })
          })
          .catch((error) => {
            console.error("Error finding conversation:", error)
          })
      } catch (error) {
        console.error("Socket error handling stop typing:", error)
      }
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id)

      // Remove user from connected users
      if (userId) {
        connectedUsers.delete(userId)

        // Broadcast updated online users
        broadcastOnlineUsers()
      }
    })
  })

  return io
}

// Broadcast online users to all connected clients
const broadcastOnlineUsers = () => {
  const onlineUsers = Array.from(connectedUsers.entries()).map(([userId, socketId]) => ({
    userId,
    socketId,
  }))

  io.emit("getUsers", onlineUsers)
}

// Get the io instance
const getIo = () => {
  if (!io) {
    throw new Error("Socket.io not initialized")
  }
  return io
}

module.exports = {
  initializeSocket,
  getIo,
}
