const express = require("express")
const router = express.Router()
const taskController = require("../controllers/taskController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.get("/", taskController.getAllTasks)
router.get("/:id", taskController.getTaskById)

// Protected routes
router.use(authMiddleware) // Apply auth middleware to all routes below
router.post("/", taskController.createTask)
router.get("/my-tasks", taskController.getMyTasks)
router.get("/recommended", taskController.getRecommendedTasks) // New endpoint for recommended tasks
router.put("/:id", taskController.updateTask)
router.delete("/:id", taskController.deleteTask)
router.post("/:id/apply", taskController.applyForTask)
router.put("/:id/complete", taskController.completeTask)

module.exports = router
