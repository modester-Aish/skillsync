const User = require("../models/userModel")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const userExists = await User.findOne({ email })
    if (userExists) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed in the model's pre-save hook
    })

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    })

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    })

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    user.bio = req.body.bio || user.bio
    user.location = req.body.location || user.location

    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      bio: updatedUser.bio,
      location: updatedUser.location,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Get user skills
exports.getUserSkills = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("skills")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user.skills)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}

// Add user skill
exports.addUserSkill = async (req, res) => {
  try {
    const { skill, proficiency } = req.body

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Check if skill already exists
    const skillExists = user.skills.find((s) => s.name === skill)
    if (skillExists) {
      return res.status(400).json({ message: "Skill already exists" })
    }

    user.skills.push({ name: skill, proficiency })
    await user.save()

    res.status(201).json(user.skills)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
}
