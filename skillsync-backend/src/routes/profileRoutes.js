const express = require("express")
const router = express.Router()
const profileController = require("../controllers/profileController")
const authMiddleware = require("../middleware/authMiddleware")
const upload = require("../middleware/uploadMiddleware")

// All profile routes are protected
router.use(authMiddleware)

// Get user profile
router.get("/", profileController.getProfile)

// Update user profile
router.put("/", profileController.updateProfile)

// Upload portfolio image
router.post("/upload", upload.single("image"), profileController.uploadImage)

// Delete portfolio image
router.delete("/portfolio/:imageIndex", profileController.deletePortfolioImage)

module.exports = router
