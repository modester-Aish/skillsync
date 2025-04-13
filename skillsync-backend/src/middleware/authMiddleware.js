const jwt = require("jsonwebtoken")
const User = require("../models/userModel")

const authMiddleware = async (req, res, next) => {
  try {
    let token

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1]
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" })
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Get user from token
    req.user = await User.findById(decoded.id).select("-password")
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, user not found" })
    }

    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    res.status(401).json({ message: "Not authorized, token failed" })
  }
}

module.exports = authMiddleware
