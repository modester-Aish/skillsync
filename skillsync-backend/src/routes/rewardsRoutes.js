const express = require("express")
const router = express.Router()
const rewardsController = require("../controllers/rewardsController")
const authMiddleware = require("../middleware/authMiddleware")

// Get user rewards (protected)
router.get("/", authMiddleware, rewardsController.getUserRewards)

// Get leaderboard (public)
router.get("/leaderboard", rewardsController.getLeaderboard)

// Redeem credits (protected)
router.post("/redeem", authMiddleware, rewardsController.redeemCredits)

module.exports = router
