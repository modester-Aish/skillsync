"use client"

import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { LayoutDashboard, PlusCircle, CheckSquare, Award, MessageSquare, LogOut, Menu, X, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const location = useLocation()
  const { logout } = useAuth()

  // Check if mobile on mount and when window resizes
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 768) {
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const handleLogout = () => {
    logout()
  }

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Post Task", icon: <PlusCircle size={20} />, path: "/post-task" },
    { name: "My Tasks", icon: <CheckSquare size={20} />, path: "/my-tasks" },
    { name: "Rewards", icon: <Award size={20} />, path: "/rewards" },
    { name: "Chat", icon: <MessageSquare size={20} />, path: "/chat" },
    { name: "Profile", icon: <User size={20} />, path: "/profile" },
  ]

  return (
    <>
      {/* Mobile hamburger menu */}
      <div className="md:hidden fixed top-4 left-4 z-30">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-md bg-blue-800 text-white hover:bg-blue-700 transition-colors"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={toggleSidebar} aria-hidden="true"></div>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: isMobile ? -280 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -280 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`fixed left-0 top-0 z-20 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-lg ${
              isMobile ? "z-30" : ""
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="p-5 border-b border-blue-700">
                <h1 className="text-2xl font-bold">
                  Skill<span className="text-purple-400">Sync</span>
                </h1>
              </div>

              {/* Navigation */}
              <nav className="flex-grow p-5 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-3 p-3 rounded-md transition-colors ${
                      location.pathname === item.path
                        ? "bg-blue-700 text-white"
                        : "text-blue-100 hover:bg-blue-700 hover:text-white"
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>

              {/* Logout button */}
              <div className="p-5 border-t border-blue-700">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full p-3 rounded-md text-blue-100 hover:bg-blue-700 hover:text-white transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content padding to account for sidebar */}
      <div className={`transition-all duration-300 ${isOpen ? "md:ml-64" : "ml-0"}`}></div>
    </>
  )
}

export default Sidebar
