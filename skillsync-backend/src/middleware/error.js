/**
 * Custom error handling middleware
 * Provides consistent error responses across the API
 */
const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.stack)

  // Default error values
  let statusCode = err.statusCode || 500
  let message = err.message || "Server Error"
  let errors = err.errors || null

  // Handle Mongoose validation errors
  if (err.name === "ValidationError") {
    statusCode = 400
    message = "Validation Error"
    errors = Object.values(err.errors).map((val) => val.message)
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400
    message = "Duplicate field value entered"

    // Extract the duplicate field
    const field = Object.keys(err.keyValue)[0]
    errors = [`${field} already exists`]
  }

  // Handle Mongoose cast errors (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    statusCode = 400
    message = `Invalid ${err.path}`
    errors = [`${err.value} is not a valid ${err.kind} for ${err.path}`]
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401
    message = "Invalid token"
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401
    message = "Token expired"
  }

  // Construct the error response
  const errorResponse = {
    success: false,
    status: statusCode,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  }

  res.status(statusCode).json(errorResponse)
}

module.exports = errorHandler
