const User = require("../models/userModel")
const fs = require("fs")
const path = require("path")

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    res.status(500).json({
      message: "Server error while fetching profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, location, skills, portfolio } = req.body

    // Find user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Update fields
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (location !== undefined) user.location = location
    if (skills) user.skills = skills
    if (portfolio) user.portfolio = portfolio

    // Save user
    const updatedUser = await user.save()

    // Return updated user without password
    const userResponse = updatedUser.toObject()
    delete userResponse.password

    res.json(userResponse)
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({
      message: "Server error while updating profile",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Upload portfolio image
// @route   POST /api/profile/upload
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Get the file path
    const filePath = `/uploads/${req.file.filename}`

    // Find user
    const user = await User.findById(req.user.id)
    if (!user) {
      // Delete the uploaded file if user not found
      fs.unlinkSync(path.join(__dirname, `../../public${filePath}`))
      return res.status(404).json({ message: "User not found" })
    }

    // Add image to portfolio
    user.portfolio.push(filePath)
    await user.save()

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: filePath,
    })
  } catch (error) {
    console.error("Error uploading image:", error)
    // Delete the uploaded file if there's an error
    if (req.file) {
      try {
        fs.unlinkSync(path.join(__dirname, `../../public/uploads/${req.file.filename}`))
      } catch (unlinkError) {
        console.error("Error deleting file:", unlinkError)
      }
    }
    res.status(500).json({
      message: "Server error while uploading image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Delete portfolio image
// @route   DELETE /api/profile/portfolio/:imageIndex
// @access  Private
exports.deletePortfolioImage = async (req, res) => {
  try {
    const { imageIndex } = req.params

    // Find user
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if image exists
    if (!user.portfolio[imageIndex]) {
      return res.status(404).json({ message: "Image not found" })
    }

    // Get the file path
    const filePath = user.portfolio[imageIndex]

    // Remove image from portfolio
    user.portfolio.splice(imageIndex, 1)
    await user.save()

    // Delete the file from the server
    try {
      fs.unlinkSync(path.join(__dirname, `../../public${filePath}`))
    } catch (unlinkError) {
      console.error("Error deleting file:", unlinkError)
      // Continue even if file deletion fails
    }

    res.json({
      message: "Image deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting image:", error)
    res.status(500).json({
      message: "Server error while deleting image",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
