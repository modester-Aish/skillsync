"use client"

import { useEffect } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"

const Home = () => {
  useEffect(() => {
    document.title = "SkillSync - Share Your Skills, Earn Rewards"
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <motion.section
          className="bg-gradient-to-br from-blue-900 via-blue-700 to-purple-400 text-white py-20 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <motion.h1
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                Share Your Skills, Earn Rewards
              </motion.h1>
              <motion.p
                className="text-lg md:text-xl mb-8 max-w-3xl mx-auto"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Connect with people in your community to exchange skills, complete micro-tasks, and earn rewards.
                SkillSync makes it easy to help others while growing your own abilities.
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Button className="bg-gradient-to-r from-blue-500 to-purple-400 hover:from-blue-600 hover:to-purple-500 text-white px-8 py-6 text-lg rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
                  Get Started
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Features Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How SkillSync Works</h2>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Post a Task</h3>
                <p className="text-gray-600">Share what you need help with and set a reward for completion.</p>
              </div>

              {/* Feature 2 */}
              <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Connect</h3>
                <p className="text-gray-600">Chat with skilled individuals in your area who can help.</p>
              </div>

              {/* Feature 3 */}
              <div className="bg-blue-50 p-6 rounded-xl hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-800">Complete & Reward</h3>
                <p className="text-gray-600">
                  Get your task done and reward the helper with points or skills exchange.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-purple-400 to-blue-500 py-16 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to start sharing skills?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Join our community today and discover the power of skill exchange.
            </p>
            <Button className="bg-white text-blue-700 hover:bg-gray-100 px-8 py-3 text-lg rounded-lg font-semibold transition-all duration-300 hover:shadow-lg">
              Sign Up Now
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home
