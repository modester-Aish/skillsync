"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useAuth } from "../../hooks/useAuth"
import Sidebar from "../../components/Sidebar"
import { Button } from "../../components/ui/button"
import { Card, CardContent } from "../../components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table"
import { AlertCircle, Award, Check, CreditCard, Gift, Medal, Star, Trophy, X } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "../../hooks/use-toast"

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api"

// Badge definitions with icons and descriptions
const BADGE_DEFINITIONS = {
  "Task Master": {
    icon: <Trophy className="h-8 w-8 text-yellow-500" />,
    description: "Completed 10+ tasks",
    color: "bg-yellow-100 border-yellow-300",
  },
  "Skill Guru": {
    icon: <Star className="h-8 w-8 text-purple-500" />,
    description: "Added 5+ skills with advanced proficiency",
    color: "bg-purple-100 border-purple-300",
  },
  "Community Helper": {
    icon: <Gift className="h-8 w-8 text-green-500" />,
    description: "Helped 5+ different users",
    color: "bg-green-100 border-green-300",
  },
  "Top Rated": {
    icon: <Medal className="h-8 w-8 text-blue-500" />,
    description: "Maintained 4.5+ rating with 5+ reviews",
    color: "bg-blue-100 border-blue-300",
  },
  "Early Adopter": {
    icon: <Award className="h-8 w-8 text-red-500" />,
    description: "Joined during the platform's first month",
    color: "bg-red-100 border-red-300",
  },
}

// Redemption options
const REDEMPTION_OPTIONS = [
  {
    id: "cash",
    title: "Cash Payout",
    description: "Convert your credits to cash. $1 for every 100 credits.",
    icon: <CreditCard className="h-6 w-6 text-green-500" />,
    minCredits: 500,
    conversionRate: 0.01, // $0.01 per credit
  },
  {
    id: "premium",
    title: "Premium Membership",
    description: "1 month of premium features with priority task matching.",
    icon: <Star className="h-6 w-6 text-purple-500" />,
    minCredits: 300,
    value: "1 Month Premium",
  },
  {
    id: "boost",
    title: "Task Boost",
    description: "Boost 3 of your tasks to the top of search results.",
    icon: <Trophy className="h-6 w-6 text-blue-500" />,
    minCredits: 200,
    value: "3 Task Boosts",
  },
]

const Rewards = () => {
  const { user } = useAuth()
  const [rewards, setRewards] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false)
  const [selectedRedemption, setSelectedRedemption] = useState(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [recentlyUnlockedBadge, setRecentlyUnlockedBadge] = useState(null)

  // Fetch rewards and leaderboard data on component mount
  useEffect(() => {
    fetchRewardsData()
  }, [])

  const fetchRewardsData = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      // Fetch user rewards
      const rewardsResponse = await axios.get(`${API_URL}/rewards`, config)
      setRewards(rewardsResponse.data)

      // Check for newly unlocked badges
      const storedBadges = JSON.parse(localStorage.getItem("userBadges") || "[]")
      if (rewardsResponse.data.badges.length > storedBadges.length) {
        // Find the new badge
        const newBadges = rewardsResponse.data.badges.filter((badge) => !storedBadges.includes(badge))
        if (newBadges.length > 0) {
          setRecentlyUnlockedBadge(newBadges[0])
        }
      }
      // Update stored badges
      localStorage.setItem("userBadges", JSON.stringify(rewardsResponse.data.badges))

      // Fetch leaderboard
      const leaderboardResponse = await axios.get(`${API_URL}/rewards/leaderboard`)
      setLeaderboard(leaderboardResponse.data)
    } catch (err) {
      console.error("Error fetching rewards data:", err)
      setError("Failed to load rewards data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemOpen = (option) => {
    setSelectedRedemption(option)
    setIsRedeemModalOpen(true)
  }

  const handleRedeemClose = () => {
    setSelectedRedemption(null)
    setIsRedeemModalOpen(false)
  }

  const handleRedeemConfirm = async () => {
    if (!selectedRedemption) return

    try {
      setIsRedeeming(true)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      await axios.post(
        `${API_URL}/rewards/redeem`,
        {
          option: selectedRedemption.id,
          credits: selectedRedemption.minCredits,
        },
        config,
      )

      // Update rewards data after redemption
      const rewardsResponse = await axios.get(`${API_URL}/rewards`, config)
      setRewards(rewardsResponse.data)

      toast({
        title: "Redemption Successful",
        description: `You've redeemed ${selectedRedemption.minCredits} credits for ${selectedRedemption.title}!`,
      })

      handleRedeemClose()
    } catch (err) {
      console.error("Error redeeming credits:", err)
      toast({
        title: "Redemption Failed",
        description: err.response?.data?.message || "Failed to redeem credits. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
    }
  }

  // Render loading state
  if (loading && !rewards) {
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
  if (error && !rewards) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12 flex justify-center items-center h-screen">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Failed to load rewards</h3>
            <p className="mt-1 text-sm text-gray-500">{error}</p>
            <Button onClick={fetchRewardsData} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="md:ml-64 pt-6 px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-4xl mx-auto">
          {/* Credits Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">Your Rewards</h1>
                <p className="text-gray-600 mt-1">Earn credits by completing tasks and helping others</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-gradient-to-r from-blue-800 to-purple-400 text-white px-4 py-2 rounded-full font-bold text-lg">
                  {rewards?.credits || 0} Skill Credits
                </div>
                <Button
                  onClick={() => setIsRedeemModalOpen(true)}
                  className="mt-3 bg-gradient-to-r from-blue-700 to-purple-500 hover:from-blue-800 hover:to-purple-600 text-white"
                  disabled={!rewards || rewards.credits < 200}
                >
                  Redeem Credits
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="badges" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="badges">Badges & Achievements</TabsTrigger>
              <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
            </TabsList>

            {/* Badges Tab */}
            <TabsContent value="badges" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Your Badges</h2>

                  {rewards?.badges && rewards.badges.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {rewards.badges.map((badge, index) => (
                        <motion.div
                          key={index}
                          className={`border ${
                            BADGE_DEFINITIONS[badge]?.color || "bg-gray-100 border-gray-300"
                          } rounded-lg p-4 flex flex-col items-center text-center`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05 }}
                        >
                          {BADGE_DEFINITIONS[badge]?.icon || <Award className="h-8 w-8 text-gray-500" />}
                          <h3 className="font-semibold mt-2">{badge}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {BADGE_DEFINITIONS[badge]?.description || "Special achievement"}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
                      <Award className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No badges yet</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Complete tasks and help others to earn badges and achievements.
                      </p>
                    </div>
                  )}

                  <div className="mt-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Available Badges</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(BADGE_DEFINITIONS)
                        .filter(([badge]) => !rewards?.badges.includes(badge))
                        .map(([badge, details], index) => (
                          <div
                            key={index}
                            className={`border ${
                              details.color || "bg-gray-100 border-gray-300"
                            } rounded-lg p-4 flex flex-col items-center text-center opacity-60`}
                          >
                            {details.icon || <Award className="h-8 w-8 text-gray-500" />}
                            <h3 className="font-semibold mt-2">{badge}</h3>
                            <p className="text-sm text-gray-600 mt-1">{details.description || "Special achievement"}</p>
                          </div>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="mt-0">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Top Contributors</h2>

                  {leaderboard.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Rank</TableHead>
                            <TableHead>User</TableHead>
                            <TableHead className="text-right">Credits</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leaderboard.map((entry, index) => (
                            <TableRow key={entry._id} className={entry._id === user?._id ? "bg-blue-50" : undefined}>
                              <TableCell className="font-medium">
                                {index === 0 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-yellow-100 text-yellow-800 rounded-full">
                                    1
                                  </span>
                                ) : index === 1 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-800 rounded-full">
                                    2
                                  </span>
                                ) : index === 2 ? (
                                  <span className="inline-flex items-center justify-center w-8 h-8 bg-amber-100 text-amber-800 rounded-full">
                                    3
                                  </span>
                                ) : (
                                  index + 1
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-800 font-semibold mr-2">
                                    {entry.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{entry.name}</div>
                                    <div className="text-sm text-gray-500">{entry.location || "No location"}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right font-semibold">
                                {entry.credits}
                                {entry._id === user?._id && <span className="ml-2 text-xs text-blue-600">(You)</span>}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-md">
                      <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No leaderboard data</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Be the first to earn credits and appear on the leaderboard!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Redemption Options Modal */}
      <Dialog open={isRedeemModalOpen} onOpenChange={setIsRedeemModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Redeem Your Credits</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500 mb-4">
              You have <span className="font-semibold text-blue-600">{rewards?.credits || 0}</span> credits available to
              redeem.
            </p>

            <div className="space-y-4">
              {REDEMPTION_OPTIONS.map((option) => (
                <div
                  key={option.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedRedemption?.id === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  } ${rewards?.credits < option.minCredits ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => rewards?.credits >= option.minCredits && handleRedeemOpen(option)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">{option.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-medium">{option.title}</h3>
                      <p className="text-sm text-gray-600">{option.description}</p>
                      <div className="mt-2 text-sm font-semibold text-blue-600">Cost: {option.minCredits} credits</div>
                    </div>
                    {selectedRedemption?.id === option.id && (
                      <div className="ml-2">
                        <Check className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={handleRedeemClose}>
              Cancel
            </Button>
            <Button
              onClick={handleRedeemConfirm}
              disabled={!selectedRedemption || isRedeeming || rewards?.credits < (selectedRedemption?.minCredits || 0)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRedeeming ? "Processing..." : "Confirm Redemption"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Unlock Animation */}
      {recentlyUnlockedBadge && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 100 }}
          className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-blue-200 p-4 max-w-sm z-50"
        >
          <div className="flex items-start">
            <div className="mr-3">
              {BADGE_DEFINITIONS[recentlyUnlockedBadge]?.icon || <Award className="h-8 w-8 text-blue-500" />}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">New Badge Unlocked!</h3>
              <p className="font-medium text-blue-600">{recentlyUnlockedBadge}</p>
              <p className="text-sm text-gray-600 mt-1">
                {BADGE_DEFINITIONS[recentlyUnlockedBadge]?.description || "You've earned a special achievement!"}
              </p>
            </div>
            <button onClick={() => setRecentlyUnlockedBadge(null)} className="ml-2 text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default Rewards
