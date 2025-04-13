const User = require("../models/userModel")

// @desc    Get user rewards (credits and badges)
// @route   GET /api/rewards
// @access  Private
exports.getUserRewards = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("credits badges")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check for badge eligibility
    await checkAndUpdateBadges(user._id)

    // Get updated user data
    const updatedUser = await User.findById(req.user.id).select("credits badges")

    res.json({
      credits: updatedUser.credits,
      badges: updatedUser.badges,
    })
  } catch (error) {
    console.error("Error fetching user rewards:", error)
    res.status(500).json({
      message: "Server error while fetching rewards",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get leaderboard (top users by credits)
// @route   GET /api/rewards/leaderboard
// @access  Public
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find().select("name location credits badges").sort({ credits: -1 }).limit(10)

    res.json(leaderboard)
  } catch (error) {
    console.error("Error fetching leaderboard:", error)
    res.status(500).json({
      message: "Server error while fetching leaderboard",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Redeem credits
// @route   POST /api/rewards/redeem
// @access  Private
exports.redeemCredits = async (req, res) => {
  try {
    const { option, credits } = req.body

    if (!option || !credits) {
      return res.status(400).json({ message: "Please provide option and credits" })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if user has enough credits
    if (user.credits < credits) {
      return res.status(400).json({ message: "Insufficient credits" })
    }

    // Deduct credits
    user.credits -= credits

    // Add to redemption history
    user.redemptionHistory.push({
      option,
      credits,
      redeemedAt: Date.now(),
    })

    await user.save()

    res.json({
      message: "Credits redeemed successfully",
      remainingCredits: user.credits,
    })
  } catch (error) {
    console.error("Error redeeming credits:", error)
    res.status(500).json({
      message: "Server error while redeeming credits",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Helper function to check and update badges
const checkAndUpdateBadges = async (userId) => {
  try {
    const user = await User.findById(userId)
    if (!user) return

    const currentBadges = new Set(user.badges)
    let badgesUpdated = false

    // Check for Task Master badge
    if (!currentBadges.has("Task Master") && user.completedTasks >= 10) {
      currentBadges.add("Task Master")
      badgesUpdated = true
    }

    // Check for Skill Guru badge
    if (!currentBadges.has("Skill Guru")) {
      const advancedSkills = user.skills.filter(
        (skill) => skill.proficiency === "advanced" || skill.proficiency === "expert",
      )
      if (advancedSkills.length >= 5) {
        currentBadges.add("Skill Guru")
        badgesUpdated = true
      }
    }

    // Check for Community Helper badge
    if (!currentBadges.has("Community Helper")) {
      // This would require a more complex query to count unique users helped
      // For simplicity, we'll use completedTasks as a proxy
      if (user.completedTasks >= 5) {
        currentBadges.add("Community Helper")
        badgesUpdated = true
      }
    }

    // Check for Top Rated badge
    if (!currentBadges.has("Top Rated") && user.rating.average >= 4.5 && user.rating.count >= 5) {
      currentBadges.add("Top Rated")
      badgesUpdated = true
    }

    // Check for Early Adopter badge
    if (!currentBadges.has("Early Adopter")) {
      // Check if user joined within the first month of the platform
      // This is a simplified check - in a real app, you'd compare against the platform launch date
      const oneMonthAfterLaunch = new Date("2023-01-31") // Example launch date + 1 month
      if (user.createdAt <= oneMonthAfterLaunch) {
        currentBadges.add("Early Adopter")
        badgesUpdated = true
      }
    }

    // Update user if badges changed
    if (badgesUpdated) {
      user.badges = Array.from(currentBadges)
      await user.save()
    }
  } catch (error) {
    console.error("Error checking badges:", error)
  }
}
