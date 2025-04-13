"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../hooks/useAuth"
import Sidebar from "../../components/Sidebar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Badge } from "../../components/ui/badge"
import { Card, CardContent } from "../../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Label } from "../../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { AlertCircle, Camera, Edit, Plus, Star, Trash2, Upload, X } from "lucide-react"
import { toast } from "../../hooks/use-toast"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

const Profile = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState(null)
  const [newSkill, setNewSkill] = useState({ name: "", proficiency: "intermediate" })
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.get(`${API_URL}/profile`, config)
      setProfile(response.data)
      setEditedProfile(response.data)
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setEditedProfile(profile)
    }
    setIsEditing(!isEditing)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillInputChange = (e) => {
    const { name, value } = e.target
    setNewSkill((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSkillProficiencyChange = (value) => {
    setNewSkill((prev) => ({
      ...prev,
      proficiency: value,
    }))
  }

  const handleAddSkill = () => {
    if (!newSkill.name.trim()) {
      toast({
        title: "Error",
        description: "Skill name cannot be empty",
        variant: "destructive",
      })
      return
    }

    // Check if skill already exists
    const skillExists = editedProfile.skills.some((skill) => skill.name.toLowerCase() === newSkill.name.toLowerCase())

    if (skillExists) {
      toast({
        title: "Error",
        description: "This skill already exists in your profile",
        variant: "destructive",
      })
      return
    }

    setEditedProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, newSkill],
    }))

    // Reset new skill form
    setNewSkill({ name: "", proficiency: "intermediate" })
    setIsAddingSkill(false)
  }

  const handleRemoveSkill = (index) => {
    setEditedProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }))
  }

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImage(e.target.files[0])
    }
  }

  const uploadImage = async (file) => {
    try {
      setIsUploading(true)
      setUploadProgress(0)

      const token = localStorage.getItem("token")
      const formData = new FormData()
      formData.append("image", file)

      const response = await axios.post(`${API_URL}/profile/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      // Add the new image URL to the portfolio
      setEditedProfile((prev) => ({
        ...prev,
        portfolio: [...prev.portfolio, response.data.imageUrl],
      }))

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (err) {
      console.error("Error uploading image:", err)
      toast({
        title: "Error",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemovePortfolioImage = (index) => {
    setEditedProfile((prev) => ({
      ...prev,
      portfolio: prev.portfolio.filter((_, i) => i !== index),
    }))
  }

  const handleSaveProfile = async () => {
    try {
      setLoading(true)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.put(`${API_URL}/profile`, editedProfile, config)
      setProfile(response.data)
      setIsEditing(false)

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Render loading state
  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error && !profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12 flex justify-center items-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Failed to load profile</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <Button onClick={fetchProfile} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Calculate average rating
  const averageRating = profile?.rating?.count > 0 ? profile.rating.average : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-800 to-purple-400 rounded-lg p-6 mb-6 text-white shadow-md">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/20 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                  {profile?.avatar ? (
                    <img
                      src={profile.avatar || "/placeholder.svg"}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    profile?.name?.charAt(0)
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold">{profile?.name}</h1>
                <p className="text-blue-100 mt-1">{profile?.email}</p>
                <p className="text-blue-100 mt-1">
                  <span className="inline-flex items-center">
                    <span className="mr-1">{profile?.location || "No location set"}</span>
                  </span>
                </p>

                <div className="mt-4">
                  <Button
                    onClick={handleEditToggle}
                    variant={isEditing ? "destructive" : "secondary"}
                    className="bg-white text-blue-800 hover:bg-blue-50"
                  >
                    {isEditing ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> Cancel Editing
                      </>
                    ) : (
                      <>
                        <Edit className="mr-2 h-4 w-4" /> Edit Profile
                      </>
                    )}
                  </Button>
                  {isEditing && (
                    <Button
                      onClick={handleSaveProfile}
                      className="ml-2 bg-green-500 hover:bg-green-600 text-white"
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-gray-500">Tasks Completed</h3>
                <p className="text-3xl font-bold text-blue-800 mt-2">{profile?.completedTasks || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-gray-500">Credits Earned</h3>
                <p className="text-3xl font-bold text-blue-800 mt-2">{profile?.credits || 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <h3 className="text-lg font-medium text-gray-500">Rating</h3>
                <div className="flex items-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(averageRating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {averageRating.toFixed(1)} ({profile?.rating?.count || 0} reviews)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="bio" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="bio">Bio</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            </TabsList>

            {/* Bio Tab */}
            <TabsContent value="bio" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About Me</h2>
                  {isEditing ? (
                    <Textarea
                      name="bio"
                      value={editedProfile.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself, your experience, and what you're looking for..."
                      className="min-h-[150px]"
                    />
                  ) : (
                    <p className="text-gray-700 whitespace-pre-line">
                      {profile.bio || "No bio information provided yet."}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Skills</h2>
                    {isEditing && (
                      <Button
                        size="sm"
                        onClick={() => setIsAddingSkill(true)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Skill
                      </Button>
                    )}
                  </div>

                  {/* Skills list */}
                  <div className="flex flex-wrap gap-2">
                    {editedProfile?.skills?.length > 0 ? (
                      editedProfile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1 text-sm bg-blue-50 text-blue-800 border-blue-200 flex items-center"
                        >
                          {skill.name} <span className="text-xs ml-1 text-blue-600">({skill.proficiency})</span>
                          {isEditing && (
                            <button
                              onClick={() => handleRemoveSkill(index)}
                              className="ml-2 text-red-500 hover:text-red-700"
                              aria-label="Remove skill"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          )}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500">No skills added yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*"
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          onClick={() => fileInputRef.current.click()}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>
                              <span className="mr-2">{uploadProgress}%</span> Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" /> Add Image
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Portfolio gallery */}
                  {editedProfile?.portfolio?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {editedProfile.portfolio.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={`Portfolio item ${index + 1}`}
                            className="w-full h-48 object-cover rounded-md"
                          />
                          {isEditing && (
                            <button
                              onClick={() => handleRemovePortfolioImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove image"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No portfolio images</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {isEditing ? "Upload images to showcase your work" : "No portfolio images have been added yet."}
                      </p>
                      {isEditing && (
                        <Button onClick={() => fileInputRef.current.click()} variant="outline" className="mt-4">
                          <Upload className="mr-2 h-4 w-4" /> Upload Image
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Add Skill Dialog */}
      <Dialog open={isAddingSkill} onOpenChange={setIsAddingSkill}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="skill-name">Skill Name</Label>
              <Input
                id="skill-name"
                name="name"
                value={newSkill.name}
                onChange={handleSkillInputChange}
                placeholder="e.g., JavaScript, Graphic Design, Teaching"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proficiency">Proficiency Level</Label>
              <Select value={newSkill.proficiency} onValueChange={handleSkillProficiencyChange}>
                <SelectTrigger id="proficiency">
                  <SelectValue placeholder="Select proficiency level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingSkill(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddSkill}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Profile
