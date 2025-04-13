const User = require("../models/userModel")
const jwt = require("jsonwebtoken")

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  })
}

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password, location } = req.body

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
      location: location || "",
    })

    // Generate JWT token
    const token = generateToken(user._id)

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        credits: user.credits,
        skills: user.skills,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)
    res.status(500).json({
      message: "Server error during signup",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = generateToken(user._id)

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        credits: user.credits,
        skills: user.skills,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get current user
// @route   GET /api/auth/user
// @access  Private
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Get user error:", error)
    res.status(500).json({
      message: "Server error while fetching user data",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}
