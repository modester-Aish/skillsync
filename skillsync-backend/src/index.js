const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")
const morgan = require("morgan")
const dotenv = require("dotenv")
const http = require("http")
const path = require("path")
const { initializeSocket } = require("./socket")
const errorHandler = require("./middleware/error")

// Load environment variables
dotenv.config()

// Initialize Express app
const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000"

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.io
initializeSocket(server)

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Request logging
app.use(morgan("dev"))

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "../public")))

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", environment: process.env.NODE_ENV })
})

// Import and use route files
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const taskRoutes = require("./routes/taskRoutes")
const chatRoutes = require("./routes/chat")
const profileRoutes = require("./routes/profileRoutes")
const rewardsRoutes = require("./routes/rewardsRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/profile", profileRoutes)
app.use("/api/rewards", rewardsRoutes)

// Error handling middleware
app.use(errorHandler)

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB")
    // Start server after successful database connection
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
      console.log(`Frontend URL: ${FRONTEND_URL}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  })

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err)
  // Close server & exit process
  server.close(() => process.exit(1))
})

module.exports = app
