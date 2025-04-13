const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please add an email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    bio: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    avatar: {
      type: String,
      default: "",
    },
    portfolio: {
      type: [String],
      default: [],
    },
    skills: [
      {
        name: {
          type: String,
          required: true,
        },
        proficiency: {
          type: String,
          enum: ["beginner", "intermediate", "advanced", "expert"],
          default: "intermediate",
        },
      },
    ],
    credits: {
      type: Number,
      default: 0,
    },
    badges: {
      type: [String],
      default: [],
    },
    rating: {
      average: {
        type: Number,
        default: 0,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    createdTasks: {
      type: Number,
      default: 0,
    },
    redemptionHistory: [
      {
        option: {
          type: String,
          required: true,
        },
        credits: {
          type: Number,
          required: true,
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

module.exports = mongoose.model("User", userSchema)
