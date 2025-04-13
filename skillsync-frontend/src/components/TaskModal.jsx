"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

const TaskModal = ({ isOpen, onClose, onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    credits: 0,
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const handleSelectChange = (value, name) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.category) newErrors.category = "Category is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.credits || formData.credits <= 0) newErrors.credits = "Credits must be greater than 0"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      title: "",
      description: "",
      category: "",
      location: "",
      credits: 0,
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-900">Post a New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Task Title
            </Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a clear title for your task"
              className={errors.title ? "border-red-300" : ""}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you need help with"
              rows={4}
              className={errors.description ? "border-red-300" : ""}
            />
            {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Category
            </Label>
            <Select value={formData.category} onValueChange={(value) => handleSelectChange(value, "category")}>
              <SelectTrigger className={errors.category ? "border-red-300" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Coding">Coding</SelectItem>
                <SelectItem value="Tutoring">Tutoring</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City or zip code"
              className={errors.location ? "border-red-300" : ""}
            />
            {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="credits" className="text-sm font-medium">
              Credits
            </Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              min="1"
              value={formData.credits}
              onChange={handleChange}
              placeholder="How many credits are you offering?"
              className={errors.credits ? "border-red-300" : ""}
            />
            {errors.credits && <p className="text-sm text-red-500">{errors.credits}</p>}
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-800 to-purple-400 hover:from-blue-700 hover:to-purple-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default TaskModal
