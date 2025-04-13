"use client"

import { useState, useEffect, useCallback } from "react"
import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      loadUser(token)
    }
  }, [])

  // Load user data using token
  const loadUser = async (token) => {
    try {
      setLoading(true)
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
      const response = await axios.get(`${API_URL}/auth/user`, config)
      setUser(response.data)
      setIsAuthenticated(true)
    } catch (err) {
      console.error("Error loading user:", err.response?.data?.message || err.message)
      localStorage.removeItem("token")
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  // Form validation
  const validateForm = (data) => {
    const errors = {}

    // Validate name
    if (data.name && data.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters"
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      errors.email = "Please enter a valid email address"
    }

    // Validate password
    if (data.password && data.password.length < 6) {
      errors.password = "Password must be at least 6 characters"
    }

    // Validate confirm password
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
    }

    return errors
  }

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      })

      const { token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("token", token)

      // Set user data
      setUser(user)
      setIsAuthenticated(true)

      return true
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Register user
  const signup = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      // Remove confirmPassword before sending to API
      const { confirmPassword, ...signupData } = userData

      const response = await axios.post(`${API_URL}/auth/signup`, signupData)

      const { token, user } = response.data

      // Save token to localStorage
      localStorage.setItem("token", token)

      // Set user data
      setUser(user)
      setIsAuthenticated(true)

      return true
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
      return false
    } finally {
      setLoading(false)
    }
  }

  // Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
  }, [])

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    signup,
    logout,
    validateForm,
  }
}
