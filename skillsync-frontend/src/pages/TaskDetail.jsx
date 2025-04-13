"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTaskById, applyForTask, createChat } from "../services/api"
import { useAuth } from "../context/AuthContext"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Button } from "../components/ui/button"

const TaskDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [applyMessage, setApplyMessage] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState(null)

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await getTaskById(id)
        setTask(response.data)

        // Check if user has already applied
        if (user && response.data.applicants) {
          const userApplication = response.data.applicants.find(
            (app) => app.user === user._id || app.user?._id === user._id,
          )
          if (userApplication) {
            setApplicationStatus(userApplication.status)
          }
        }
      } catch (err) {
        setError("Failed to load task details")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id, user])

  const handleApply = async () => {
    try {
      setIsApplying(true)
      await applyForTask(id, applyMessage)
      setApplicationStatus("pending")
      // Refresh task data
      const response = await getTaskById(id)
      setTask(response.data)
    } catch (err) {
      setError("Failed to apply for task")
      console.error(err)
    } finally {
      setIsApplying(false)
    }
  }

  const handleContactCreator = async () => {
    try {
      const response = await createChat({
        participantId: task.creator._id,
        taskId: task._id,
      })
      navigate(`/chats/${response.data._id}`)
    } catch (err) {
      setError("Failed to create chat")
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-red-500 text-center">
            <p className="text-xl">{error}</p>
            <Button className="mt-4" onClick={() => navigate("/tasks")}>
              Back to Tasks
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex justify-center items-center">
          <div className="text-center">
            <p className="text-xl">Task not found</p>
            <Button className="mt-4" onClick={() => navigate("/tasks")}>
              Back to Tasks
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const isCreator = user && task.creator._id === user._id
  const isCompleted = task.status === "completed"
  const canApply = !isCreator && task.status === "open" && !applicationStatus

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{task.title}</h1>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">Posted by {task.creator.name}</p>
                </div>
                <div className="flex items-center">
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
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{task.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{task.location}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Reward</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {task.reward.type === "points"
                      ? `${task.reward.value} points`
                      : task.reward.type === "skill exchange"
                        ? "Skill Exchange"
                        : task.reward.value}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Required Skills</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {task.requiredSkills && task.requiredSkills.length > 0 ? (
                        task.requiredSkills.map((skill, index) => (
                          <span key={index} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500">No specific skills required</span>
                      )}
                    </div>
                  </dd>
                </div>
              </dl>
            </div>

            {/* Action Section */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              {isCreator ? (
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-700">This is your task. You can manage it from your dashboard.</p>
                  <div className="mt-4">
                    <Button onClick={() => navigate("/dashboard")} className="mr-4">
                      Go to Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/tasks/${id}/edit`)}>
                      Edit Task
                    </Button>
                  </div>
                </div>
              ) : isCompleted ? (
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700">This task has been completed.</p>
                </div>
              ) : applicationStatus ? (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-blue-700">
                    Your application status: <span className="font-semibold">{applicationStatus}</span>
                  </p>
                  <Button onClick={handleContactCreator} className="mt-4">
                    Contact Task Creator
                  </Button>
                </div>
              ) : canApply ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Apply for this task</h3>
                  <div className="mt-3">
                    <textarea
                      rows={4}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Introduce yourself and explain why you're a good fit for this task..."
                      value={applyMessage}
                      onChange={(e) => setApplyMessage(e.target.value)}
                    />
                  </div>
                  <div className="mt-4">
                    <Button onClick={handleApply} disabled={isApplying || !applyMessage.trim()}>
                      {isApplying ? "Applying..." : "Apply Now"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-md">
                  <p className="text-red-700">This task is no longer accepting applications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default TaskDetail
