import axios from "axios"
import { toast } from "react-toastify"

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error

    // Handle different error statuses
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token")
          if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
            toast.error("Session expired. Please log in again.")
            window.location.href = "/login"
          }
          break
        case 403:
          toast.error("You do not have permission to perform this action")
          break
        case 404:
          toast.error("Resource not found")
          break
        case 500:
          toast.error("Server error. Please try again later.")
          break
        default:
          toast.error(response.data?.message || "Something went wrong")
      }
    } else {
      // Network error
      toast.error("Network error. Please check your connection.")
    }

    return Promise.reject(error)
  },
)

// API endpoints
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  signup: (userData) => api.post("/auth/signup", userData),
  getUser: () => api.get("/auth/user"),
}

export const userAPI = {
  getProfile: () => api.get("/profile"),
  updateProfile: (userData) => api.post("/profile", userData),
  addSkill: (skillData) => api.post("/profile/skills", skillData),
  uploadImage: (formData) =>
    api.post("/profile/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
}

export const taskAPI = {
  getAllTasks: (params) => api.get("/tasks", { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  createTask: (taskData) => api.post("/tasks", taskData),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  applyForTask: (id, message) => api.post(`/tasks/${id}/apply`, { message }),
  getRecommendedTasks: () => api.get("/tasks/recommended"),
}

export const chatAPI = {
  getConversations: () => api.get("/chat/conversations"),
  getMessages: (conversationId) => api.get(`/chat/messages/${conversationId}`),
  sendMessage: (conversationId, content) => api.post("/chat/messages", { conversationId, content }),
  createConversation: (userId, taskId) => api.post("/chat/conversations", { userId, taskId }),
  markAsRead: (conversationId) => api.put(`/chat/conversations/${conversationId}/read`),
}

export const rewardsAPI = {
  getUserRewards: () => api.get("/rewards"),
  getLeaderboard: () => api.get("/rewards/leaderboard"),
  redeemCredits: (option, credits) => api.post("/rewards/redeem", { option, credits }),
}

export default api
