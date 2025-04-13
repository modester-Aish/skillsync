"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getAllTasks } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Button } from "../components/ui/button"

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    category: "",
    status: "",
  })

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await getAllTasks(filters)
        setTasks(response.data)
      } catch (err) {
        setError("Failed to load tasks")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const clearFilters = () => {
    setFilters({
      category: "",
      status: "",
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Available Tasks</h1>
            <Link to="/tasks/create">
              <Button>Create New Task</Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="bg-white shadow sm:rounded-md mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Filter Tasks</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    <option value="home improvement">Home Improvement</option>
                    <option value="technology">Technology</option>
                    <option value="education">Education</option>
                    <option value="creative">Creative</option>
                    <option value="business">Business</option>
                    <option value="health">Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    value={filters.status}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-500">
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-8">{error}</div>
            ) : tasks.length === 0 ? (
              <div className="text-gray-500 text-center py-8">No tasks found matching your criteria</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <li key={task._id}>
                    <Link to={`/tasks/${task._id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-blue-600 truncate">{task.title}</p>
                            <p className="mt-1 flex items-center text-sm text-gray-500">
                              <span className="truncate">{task.location}</span>
                            </p>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                task.status === "open"
                                  ? "bg-green-100 text-green-800"
                                  : task.status === "in progress"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {task.status}
                            </span>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {task.category}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500 line-clamp-2">{task.description}</p>
                        </div>
                        <div className="mt-2 flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {task.creator?.name?.charAt(0) || "U"}
                            </div>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{task.creator?.name || "Unknown User"}</p>
                            <p className="text-sm text-gray-500">
                              Posted {new Date(task.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TaskList
