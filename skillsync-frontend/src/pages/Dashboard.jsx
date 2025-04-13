"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { getAllTasks } from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Button } from "../components/ui/button"

const Dashboard = () => {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await getAllTasks()
        setTasks(response.data)
      } catch (err) {
        setError("Failed to load tasks")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <Link to="/tasks/create">
              <Button>Create New Task</Button>
            </Link>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-md mb-8">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900">Welcome, {user?.name}!</h2>
              <p className="mt-1 text-sm text-gray-600">
                Here's your personalized dashboard. You can manage your tasks, check your messages, and update your
                profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tasks Section */}
            <div className="bg-white shadow sm:rounded-md col-span-2">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Tasks</h2>
                {loading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-4">{error}</div>
                ) : tasks.length === 0 ? (
                  <div className="text-gray-500 text-center py-4">No tasks available</div>
                ) : (
                  <ul className="divide-y divide-gray-200">
                    {tasks.slice(0, 5).map((task) => (
                      <li key={task._id} className="py-4">
                        <Link to={`/tasks/${task._id}`} className="block hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-blue-600">{task.title}</p>
                              <p className="text-sm text-gray-500 mt-1">{task.description.substring(0, 100)}...</p>
                            </div>
                            <div>
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
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4">
                  <Link to="/tasks" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                    View all tasks →
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Section */}
            <div className="bg-white shadow sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Profile</h2>
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xl font-bold mb-4">
                    {user?.name.charAt(0)}
                  </div>
                  <h3 className="text-lg font-medium">{user?.name}</h3>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                  <p className="text-gray-500 text-sm mt-1">{user?.location || "No location set"}</p>

                  <div className="mt-6 w-full">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Your Skills</h4>
                    {user?.skills && user.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.skills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {skill.name} ({skill.proficiency})
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No skills added yet</p>
                    )}
                  </div>

                  <Link to="/profile" className="mt-6 w-full">
                    <Button className="w-full">Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default Dashboard
