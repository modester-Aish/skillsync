/**
 * Custom error class for API errors
 * Extends the built-in Error class with a statusCode property
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message)
    this.statusCode = statusCode

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor)
  }
}

module.exports = ErrorResponse
