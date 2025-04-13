"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { useAuth } from "../../hooks/useAuth"
import { taskAPI } from "../../utils/api"
import Sidebar from "../../components/Sidebar"
import TaskCard from "../../components/TaskCard"
import TaskModal from "../../components/TaskModal"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Search, PlusCircle, RefreshCw, Sparkles } from "lucide-react"
import { motion } from "framer-motion"

const Dashboard = () => {
  const [tasks, setTasks] = useState([])
  const [recommendedTasks, setRecommendedTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(true)
  const [error, setError] = useState(null)
  const [recommendationError, setRecommendationError] = useState(null)
  const [searchLocation, setSearchLocation] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch tasks and recommendations on component mount
  useEffect(() => {
    fetchTasks()
    fetchRecommendedTasks()
  }, [])

  // Filter tasks when search location changes
  useEffect(() => {
    if (searchLocation.trim() === "") {
      setFilteredTasks(tasks)
    } else {
      const filtered = tasks.filter((task) => task.location.toLowerCase().includes(searchLocation.toLowerCase()))
      setFilteredTasks(filtered)
    }
  }, [searchLocation, tasks])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await taskAPI.getAllTasks()
      setTasks(response.data)
      setFilteredTasks(response.data)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError("Failed to load tasks. Please try again.")
      toast.error("Failed to load tasks. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRecommendedTasks = async () => {
    try {
      setIsLoadingRecommendations(true)
      setRecommendationError(null)

      const response = await taskAPI.getRecommendedTasks()
      setRecommendedTasks(response.data)
    } catch (err) {
      console.error("Error fetching recommended tasks:", err)
      setRecommendationError("Failed to load recommendations. Please try again.")
      // Don't show toast for recommendation errors to avoid overwhelming the user
    } finally {
      setIsLoadingRecommendations(false)
    }
  }

  const handleCreateTask = async (taskData) => {
    try {
      setIsSubmitting(true)

      const response = await taskAPI.createTask(taskData)

      // Add the new task to the list
      setTasks((prevTasks) => [response.data, ...prevTasks])

      // Close the modal
      setIsModalOpen(false)

      toast.success("Task created successfully!")
    } catch (err) {
      console.error("Error creating task:", err)
      toast.error("Failed to create task. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleApply = (taskId) => {
    navigate(`/tasks/${taskId}`)
  }

  const handleSearchChange = (e) => {
    setSearchLocation(e.target.value)
  }

  const refreshRecommendations = () => {
    fetchRecommendedTasks()
  }

  // Animation variants for staggered list
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Task Dashboard</h1>
              <p className="text-gray-600 mt-1">Find tasks that match your skills</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-r from-blue-800 to-purple-400 hover:from-blue-700 hover:to-purple-300 transition-all duration-300"
              >
                <PlusCircle size={18} className="mr-2" />
                Post New Task
              </Button>
              <Button variant="outline" onClick={fetchTasks}>
                <RefreshCw size={18} className="mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Search by location (city or zip)"
                value={searchLocation}
                onChange={handleSearchChange}
                className="pl-10 py-2 w-full md:w-96"
              />
            </div>
          </div>

          {/* Recommended Tasks Section */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Recommended Tasks</h2>
              </div>
              <Button variant="ghost" size="sm" onClick={refreshRecommendations} disabled={isLoadingRecommendations}>
                <RefreshCw size={16} className={`mr-2 ${isLoadingRecommendations ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            {isLoadingRecommendations ? (
              <div className="flex justify-center items-center h-48 bg-white rounded-lg shadow-sm">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : recommendationError ? (
              <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
                <p>{recommendationError}</p>
                <Button variant="outline" onClick={refreshRecommendations} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : recommendedTasks.length === 0 ? (
              <div className="bg-purple-50 text-purple-700 p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
                <p className="mb-4">
                  Add more skills to your profile or check back later for personalized task recommendations.
                </p>
                <Button
                  onClick={() => navigate("/profile")}
                  className="bg-gradient-to-r from-blue-700 to-purple-500 hover:from-blue-800 hover:to-purple-600 text-white"
                >
                  Update Skills
                </Button>
              </div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {recommendedTasks.map((task) => (
                  <motion.div key={task._id} variants={item}>
                    <TaskCard task={task} onApply={handleApply} isRecommended={true} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* All Tasks Section */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">All Available Tasks</h2>
          </div>

          {/* Task grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
              <p>{error}</p>
              <Button variant="outline" onClick={fetchTasks} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="bg-blue-50 text-blue-500 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="mt-2">
                {searchLocation
                  ? `No tasks match the location "${searchLocation}"`
                  : "There are no available tasks at the moment"}
              </p>
              {searchLocation && (
                <Button variant="outline" onClick={() => setSearchLocation("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredTasks.map((task) => (
                <motion.div key={task._id} variants={item}>
                  <TaskCard task={task} onApply={handleApply} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      {/* Task creation modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
      />
    </div>
  )
}

export default Dashboard
