import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor to include auth token in requests
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

// User API calls
export const registerUser = (userData) => api.post("/users/register", userData)
export const loginUser = (credentials) => api.post("/users/login", credentials)
export const getUserProfile = () => api.get("/users/profile")
export const updateUserProfile = (userData) => api.put("/users/profile", userData)

// Task API calls
export const getAllTasks = (filters = {}) => api.get("/tasks", { params: filters })
export const getTaskById = (id) => api.get(`/tasks/${id}`)
export const createTask = (taskData) => api.post("/tasks", taskData)
export const updateTask = (id, taskData) => api.put(`/tasks/${id}`, taskData)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const applyForTask = (id, message) => api.post(`/tasks/${id}/apply`, { message })

// Chat API calls
export const getUserChats = () => api.get("/chats")
export const getChatById = (id) => api.get(`/chats/${id}`)
export const createChat = (chatData) => api.post("/chats", chatData)
export const sendMessage = (chatId, content) => api.post(`/chats/${chatId}/messages`, { content })
export const getChatMessages = (chatId) => api.get(`/chats/${chatId}/messages`)

export default api
