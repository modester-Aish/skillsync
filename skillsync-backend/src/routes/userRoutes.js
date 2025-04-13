const express = require("express")
const router = express.Router()
const userController = require("../controllers/userController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)

// Protected routes
router.get("/profile", authMiddleware, userController.getUserProfile)
router.put("/profile", authMiddleware, userController.updateUserProfile)
router.get("/skills", authMiddleware, userController.getUserSkills)
router.post("/skills", authMiddleware, userController.addUserSkill)

module.exports = router
