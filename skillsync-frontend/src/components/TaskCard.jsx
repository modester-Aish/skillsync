"use client"

import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Calendar, MapPin, Award, Sparkles } from "lucide-react"

const TaskCard = ({ task, onApply, isRecommended = false }) => {
  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Truncate description
  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + "..."
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow"
    >
      {isRecommended && (
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-1 text-sm font-medium flex items-center">
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Recommended for you
        </div>
      )}
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-blue-900 mb-1">{task.title}</h3>
          <Badge
            variant="outline"
            className={`${
              task.category === "Design"
                ? "bg-purple-100 text-purple-800 border-purple-200"
                : task.category === "Coding"
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-green-100 text-green-800 border-green-200"
            }`}
          >
            {task.category}
          </Badge>
        </div>

        <p className="text-gray-600 mb-4">{truncateText(task.description, 120)}</p>

        <div className="flex flex-col space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin size={16} className="mr-2" />
            <span>{task.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar size={16} className="mr-2" />
            <span>Posted on {formatDate(task.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm font-medium text-blue-600">
            <Award size={16} className="mr-2" />
            <span>{task.credits} credits</span>
          </div>
        </div>

        <Button
          onClick={() => onApply(task._id)}
          className={`w-full ${
            isRecommended
              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              : "bg-gradient-to-r from-blue-800 to-purple-400 hover:from-blue-700 hover:to-purple-300"
          } transition-all duration-300`}
        >
          Apply Now
        </Button>
      </div>
    </motion.div>
  )
}

export default TaskCard
