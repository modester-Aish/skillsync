"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { toast } from "react-toastify"
import { authAPI } from "../utils/api"

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is logged in on page load
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")
        if (token) {
          const response = await authAPI.getUser()
          setUser(response.data)
          setIsAuthenticated(true)
        }
      } catch (err) {
        console.error("Authentication error:", err)
        localStorage.removeItem("token")
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authAPI.login({ email, password })

      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)

      toast.success("Login successful!")
      return true
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await authAPI.signup(userData)

      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      setIsAuthenticated(true)

      toast.success("Registration successful!")
      return true
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
    setIsAuthenticated(false)
    toast.info("You have been logged out")
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        login,
        register,
        logout,
        validateForm,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
