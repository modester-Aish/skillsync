const Task = require("../models/taskModel")
const User = require("../models/userModel")
const axios = require("axios")

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Public
exports.getAllTasks = async (req, res) => {
  try {
    const { category, location, status } = req.query

    // Build filter object
    const filter = { status: status || "open" } // Default to open tasks
    if (category) filter.category = category
    if (location) filter.location = { $regex: location, $options: "i" } // Case-insensitive location search

    const tasks = await Task.find(filter).populate("createdBy", "name").sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({
      message: "Server error while fetching tasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Public
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("createdBy", "name email")
      .populate("applicants.user", "name")

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({
      message: "Server error while fetching task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { title, description, category, location, credits } = req.body

    // Create task
    const task = await Task.create({
      title,
      description,
      category,
      location,
      credits: Number(credits),
      createdBy: req.user.id,
    })

    // Populate creator info
    const populatedTask = await Task.findById(task._id).populate("createdBy", "name")

    // Update user's created tasks count
    await User.findByIdAndUpdate(req.user.id, { $inc: { createdTasks: 1 } })

    res.status(201).json(populatedTask)
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({
      message: "Server error while creating task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get tasks created by the logged-in user
// @route   GET /api/tasks/my-tasks
// @access  Private
exports.getMyTasks = async (req, res) => {
  try {
    // Find tasks created by the user
    const createdTasks = await Task.find({ createdBy: req.user.id }).sort({ createdAt: -1 })

    // Find tasks the user has applied to
    const appliedTasks = await Task.find({
      "applicants.user": req.user.id,
    }).sort({ createdAt: -1 })

    res.json({
      created: createdTasks,
      applied: appliedTasks,
    })
  } catch (error) {
    console.error("Error fetching user tasks:", error)
    res.status(500).json({
      message: "Server error while fetching user tasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if user is the creator of the task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this task" })
    }

    // Update task fields
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true })

    res.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({
      message: "Server error while updating task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if user is the creator of the task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this task" })
    }

    await task.deleteOne()

    // Update user's created tasks count
    await User.findByIdAndUpdate(req.user.id, { $inc: { createdTasks: -1 } })

    res.json({ message: "Task removed" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({
      message: "Server error while deleting task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Apply for a task
// @route   POST /api/tasks/:id/apply
// @access  Private
exports.applyForTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if task is open
    if (task.status !== "open") {
      return res.status(400).json({ message: "This task is not open for applications" })
    }

    // Check if user is the creator of the task
    if (task.createdBy.toString() === req.user.id) {
      return res.status(400).json({ message: "You cannot apply to your own task" })
    }

    // Check if user already applied
    if (task.applicants.some((applicant) => applicant.user.toString() === req.user.id)) {
      return res.status(400).json({ message: "You have already applied for this task" })
    }

    // Add user to applicants
    task.applicants.push({
      user: req.user.id,
      message: req.body.message || "",
      status: "pending",
    })

    await task.save()

    res.json(task)
  } catch (error) {
    console.error("Error applying for task:", error)
    res.status(500).json({
      message: "Server error while applying for task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Complete a task
// @route   PUT /api/tasks/:id/complete
// @access  Private
exports.completeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if user is the creator of the task
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to complete this task" })
    }

    // Update task status
    task.status = "completed"
    task.completedAt = Date.now()
    task.assignedTo = req.body.assignedTo

    await task.save()

    // Update assigned user's completed tasks count and credits
    if (task.assignedTo) {
      await User.findByIdAndUpdate(task.assignedTo, {
        $inc: { completedTasks: 1, credits: task.credits },
      })
    }

    res.json(task)
  } catch (error) {
    console.error("Error completing task:", error)
    res.status(500).json({
      message: "Server error while completing task",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// @desc    Get recommended tasks based on user skills using Gemini API
// @route   GET /api/tasks/recommended
// @access  Private
exports.getRecommendedTasks = async (req, res) => {
  try {
    // Get the current user with their skills
    const user = await User.findById(req.user.id).select("skills")

    if (!user || !user.skills || user.skills.length === 0) {
      return res.status(400).json({
        message: "No skills found. Please add skills to your profile to get recommendations.",
      })
    }

    // Get all available tasks that are not created by the current user and are still open
    const availableTasks = await Task.find({
      createdBy: { $ne: req.user.id },
      status: "open",
    }).select("_id title description category requiredSkills")

    if (availableTasks.length === 0) {
      return res.json([])
    }

    // Format user skills for the Gemini API
    const userSkills = user.skills.map((skill) => ({
      name: skill.name,
      proficiency: skill.proficiency,
    }))

    // Format tasks for the Gemini API
    const tasksData = availableTasks.map((task) => ({
      id: task._id.toString(),
      title: task.title,
      description: task.description,
      category: task.category,
      requiredSkills: task.requiredSkills || [],
    }))

    // Call Gemini API to get recommendations
    const recommendedTaskIds = await getGeminiRecommendations(userSkills, tasksData)

    // If no recommendations, return empty array
    if (!recommendedTaskIds || recommendedTaskIds.length === 0) {
      return res.json([])
    }

    // Fetch the full task objects for the recommended task IDs
    const recommendedTasks = await Task.find({
      _id: { $in: recommendedTaskIds },
    })
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })

    // Add isRecommended flag to each task
    const tasksWithRecommendationFlag = recommendedTasks.map((task) => {
      const taskObj = task.toObject()
      taskObj.isRecommended = true
      return taskObj
    })

    res.json(tasksWithRecommendationFlag)
  } catch (error) {
    console.error("Error getting recommended tasks:", error)
    res.status(500).json({
      message: "Server error while getting recommended tasks",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    })
  }
}

// Helper function to get recommendations from Gemini API
async function getGeminiRecommendations(userSkills, tasksData) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY
    const GEMINI_API_URL =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"

    if (!GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not defined in environment variables")
      return []
    }

    // Prepare the prompt for Gemini API
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `You are a skill-matching assistant for a skill-sharing platform. 
              
              I'll provide you with a user's skills and a list of available tasks. 
              Your job is to recommend the top 5 tasks that best match the user's skills.

              USER SKILLS:
              ${JSON.stringify(userSkills, null, 2)}

              AVAILABLE TASKS:
              ${JSON.stringify(tasksData, null, 2)}

              Please analyze the tasks and recommend the top 5 tasks that best match the user's skills.
              Consider the following factors:
              1. Direct skill matches between user skills and task requirements
              2. Skill proficiency levels
              3. Related or transferable skills
              4. Task complexity relative to skill levels

              Return ONLY a JSON array of the recommended task IDs, ordered by match quality (best match first).
              Format: ["taskId1", "taskId2", "taskId3", "taskId4", "taskId5"]
              Do not include any explanations or other text, just the JSON array.`,
            },
          ],
        },
      ],
    }

    // Call Gemini API
    const response = await axios.post(GEMINI_API_URL, prompt, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GEMINI_API_KEY}`,
      },
      params: {
        key: GEMINI_API_KEY,
      },
    })

    // Extract and parse the response
    const generatedContent = response.data.candidates[0].content.parts[0].text

    // Clean the response to ensure it's valid JSON
    const cleanedContent = generatedContent.trim().replace(/```json|```/g, "")

    // Parse the JSON array of task IDs
    const recommendedTaskIds = JSON.parse(cleanedContent)

    // Return the top 5 task IDs (or fewer if less than 5 were recommended)
    return recommendedTaskIds.slice(0, 5)
  } catch (error) {
    console.error("Error calling Gemini API:", error.response?.data || error.message)
    return []
  }
}
