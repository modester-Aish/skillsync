const express = require("express")
const router = express.Router()
const authController = require("../controllers/authController")
const authMiddleware = require("../middleware/authMiddleware")

// Public routes
router.post("/signup", authController.signup)
router.post("/login", authController.login)

// Protected routes
router.get("/user", authMiddleware, authController.getUser)

module.exports = router
