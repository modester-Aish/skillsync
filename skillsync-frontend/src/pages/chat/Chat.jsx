"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { io } from "socket.io-client"
import { useAuth } from "../../hooks/useAuth"
import Sidebar from "../../components/Sidebar"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar"
import { Badge } from "../../components/ui/badge"
import { Skeleton } from "../../components/ui/skeleton"
import { AlertCircle, ChevronLeft, Menu, Send, User } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

const API_URL = "http://localhost:5000/api"
const SOCKET_URL = "http://localhost:5000"

const Chat = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { conversationId } = useParams()
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [socket, setSocket] = useState(null)
  const [onlineUsers, setOnlineUsers] = useState([])
  const [typing, setTyping] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Initialize socket connection
  useEffect(() => {
    if (!user) return

    const newSocket = io(SOCKET_URL, {
      query: {
        userId: user._id,
      },
    })

    setSocket(newSocket)

    // Socket event listeners
    newSocket.on("connect", () => {
      console.log("Connected to socket server")
    })

    newSocket.on("disconnect", () => {
      console.log("Disconnected from socket server")
    })

    newSocket.on("getUsers", (users) => {
      setOnlineUsers(users)
    })

    newSocket.on("getMessage", (data) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => [...prev, data])
      }

      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === data.conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: data.content,
                timestamp: data.timestamp,
              },
            }
          }
          return conv
        }),
      )
    })

    newSocket.on("typing", ({ conversationId: convId, userId }) => {
      if (convId === conversationId && userId !== user._id) {
        setIsTyping(true)
      }
    })

    newSocket.on("stopTyping", ({ conversationId: convId }) => {
      if (convId === conversationId) {
        setIsTyping(false)
      }
    })

    // Clean up on unmount
    return () => {
      newSocket.disconnect()
    }
  }, [user, conversationId])

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
      setActiveConversation(conversationId)
    } else {
      setMessages([])
      setActiveConversation(null)
    }
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check screen size for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setShowSidebar(!conversationId)
      } else {
        setShowSidebar(true)
      }
    }

    handleResize() // Initial check
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [conversationId])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.get(`${API_URL}/chat/conversations`, config)
      setConversations(response.data)
    } catch (err) {
      console.error("Error fetching conversations:", err)
      setError("Failed to load conversations. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (convId) => {
    try {
      setLoadingMessages(true)

      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.get(`${API_URL}/chat/messages/${convId}`, config)
      setMessages(response.data)

      // Mark messages as read
      await axios.put(`${API_URL}/chat/conversations/${convId}/read`, {}, config)

      // Update unread count in conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === convId) {
            return {
              ...conv,
              unreadCount: 0,
            }
          }
          return conv
        }),
      )
    } catch (err) {
      console.error("Error fetching messages:", err)
      setError("Failed to load messages. Please try again.")
    } finally {
      setLoadingMessages(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !conversationId || !socket) return

    const messageData = {
      conversationId,
      sender: user._id,
      content: newMessage.trim(),
      timestamp: new Date().toISOString(),
    }

    // Optimistically add message to UI
    setMessages((prev) => [...prev, messageData])
    setNewMessage("")

    // Emit stop typing event
    socket.emit("stopTyping", {
      conversationId,
      userId: user._id,
    })

    try {
      // Send message via socket
      socket.emit("sendMessage", messageData)

      // Also save to database via API
      const token = localStorage.getItem("token")
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      await axios.post(
        `${API_URL}/chat/messages`,
        {
          conversationId,
          content: messageData.content,
        },
        config,
      )

      // Update last message in conversations list
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv._id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                content: messageData.content,
                timestamp: messageData.timestamp,
              },
            }
          }
          return conv
        }),
      )
    } catch (err) {
      console.error("Error sending message:", err)
      // Remove the optimistically added message on error
      setMessages((prev) => prev.filter((msg) => msg !== messageData))
    }
  }

  const handleConversationClick = (convId) => {
    navigate(`/chat/${convId}`)
    if (window.innerWidth < 768) {
      setShowSidebar(false)
    }
  }

  const handleInputChange = (e) => {
    setNewMessage(e.target.value)

    if (!socket || !conversationId) return

    // Handle typing indicator
    if (!typing) {
      setTyping(true)
      socket.emit("typing", {
        conversationId,
        userId: user._id,
      })
    }

    // Clear previous timeout
    if (typingTimeout) clearTimeout(typingTimeout)

    // Set new timeout
    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        conversationId,
        userId: user._id,
      })
      setTyping(false)
    }, 2000)

    setTypingTimeout(timeout)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar)
  }

  const formatMessageTime = (dateString) => {
    return format(new Date(dateString), "h:mm a")
  }

  const formatLastMessageTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return format(date, "h:mm a")
    } else if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays < 7) {
      return format(date, "EEEE") // Day name
    } else {
      return format(date, "MMM d") // Month and day
    }
  }

  const getOtherUser = (conversation) => {
    if (!conversation || !conversation.users) return null
    return conversation.users.find((u) => u._id !== user?._id)
  }

  const getCurrentConversation = () => {
    return conversations.find((conv) => conv._id === conversationId)
  }

  const isUserOnline = (userId) => {
    return onlineUsers.some((u) => u.userId === userId)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <div className="md:ml-64 h-screen flex flex-col">
        <div className="flex flex-1 overflow-hidden">
          {/* Mobile toggle button */}
          {!showSidebar && (
            <button
              onClick={toggleSidebar}
              className="md:hidden fixed top-20 left-4 z-20 p-2 rounded-md bg-blue-800 text-white"
              aria-label="Show conversations"
            >
              <Menu size={20} />
            </button>
          )}

          {/* Conversations sidebar */}
          <AnimatePresence>
            {showSidebar && (
              <motion.div
                initial={{ x: -300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="w-full md:w-80 bg-white border-r border-gray-200 flex flex-col z-10"
              >
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-900">Messages</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {conversations.length} conversation{conversations.length !== 1 ? "s" : ""}
                  </p>
                </div>

                {/* Conversations list */}
                <div className="flex-1 overflow-y-auto">
                  {loading ? (
                    // Loading skeletons
                    <div className="p-4 space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-12 w-12 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : error ? (
                    <div className="p-4 text-center">
                      <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                      <p className="text-red-500">{error}</p>
                      <Button onClick={fetchConversations} className="mt-2" variant="outline" size="sm">
                        Try Again
                      </Button>
                    </div>
                  ) : conversations.length === 0 ? (
                    <div className="p-4 text-center">
                      <User className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500">No conversations yet</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Start a conversation by applying to a task or creating a new task
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {conversations.map((conversation) => {
                        const otherUser = getOtherUser(conversation)
                        const isOnline = otherUser ? isUserOnline(otherUser._id) : false
                        const isActive = conversation._id === conversationId

                        return (
                          <div
                            key={conversation._id}
                            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                              isActive ? "bg-blue-50" : ""
                            }`}
                            onClick={() => handleConversationClick(conversation._id)}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={otherUser?.avatar || "/placeholder.svg"} alt={otherUser?.name} />
                                  <AvatarFallback className="bg-blue-100 text-blue-800">
                                    {otherUser?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                {isOnline && (
                                  <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline">
                                  <h3 className="text-sm font-medium text-gray-900 truncate">{otherUser?.name}</h3>
                                  {conversation.lastMessage?.timestamp && (
                                    <span className="text-xs text-gray-500">
                                      {formatLastMessageTime(conversation.lastMessage.timestamp)}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                  {conversation.lastMessage?.content || "No messages yet"}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="mt-1 bg-blue-500">{conversation.unreadCount}</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chat area */}
          <div className="flex-1 flex flex-col bg-gray-50">
            {conversationId ? (
              <>
                {/* Chat header */}
                <div className="bg-white border-b border-gray-200 p-4 flex items-center">
                  <button
                    onClick={toggleSidebar}
                    className="md:hidden mr-2 text-gray-500 hover:text-gray-700"
                    aria-label="Toggle sidebar"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  {getCurrentConversation() && (
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage
                          src={getOtherUser(getCurrentConversation())?.avatar || "/placeholder.svg"}
                          alt={getOtherUser(getCurrentConversation())?.name}
                        />
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {getOtherUser(getCurrentConversation())?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {getOtherUser(getCurrentConversation())?.name}
                        </h2>
                        <div className="flex items-center">
                          {isUserOnline(getOtherUser(getCurrentConversation())?._id) ? (
                            <span className="flex items-center text-xs text-green-600">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                              Online
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Messages container */}
                <div
                  ref={chatContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{ backgroundImage: "url('/chat-bg.png')" }}
                >
                  {loadingMessages ? (
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-500">Send a message to start the conversation</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isCurrentUser = message.sender === user?._id
                        const showAvatar = index === 0 || messages[index - 1]?.sender !== message.sender

                        return (
                          <motion.div
                            key={message._id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                          >
                            <div className={`flex items-end ${isCurrentUser ? "flex-row-reverse" : "flex-row"}`}>
                              {!isCurrentUser && showAvatar && (
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage
                                    src={getOtherUser(getCurrentConversation())?.avatar || "/placeholder.svg"}
                                    alt={getOtherUser(getCurrentConversation())?.name}
                                  />
                                  <AvatarFallback className="bg-blue-100 text-blue-800">
                                    {getOtherUser(getCurrentConversation())?.name?.charAt(0) || "U"}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                                  isCurrentUser
                                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                                    : "bg-white text-gray-800 rounded-bl-none shadow-sm"
                                }`}
                              >
                                <p className="break-words">{message.content}</p>
                                <div className={`text-xs mt-1 ${isCurrentUser ? "text-blue-100" : "text-gray-500"}`}>
                                  {formatMessageTime(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}

                      {/* Typing indicator */}
                      {isTyping && (
                        <div className="flex items-end">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage
                              src={getOtherUser(getCurrentConversation())?.avatar || "/placeholder.svg"}
                              alt={getOtherUser(getCurrentConversation())?.name}
                            />
                            <AvatarFallback className="bg-blue-100 text-blue-800">
                              {getOtherUser(getCurrentConversation())?.name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-white px-4 py-2 rounded-lg rounded-bl-none shadow-sm">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.4s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Message input */}
                <div className="bg-white border-t border-gray-200 p-4">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={handleInputChange}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-gradient-to-r from-blue-800 to-purple-400 hover:from-blue-700 hover:to-purple-500"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="bg-white p-8 rounded-lg shadow-sm max-w-md">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h2>
                  <p className="text-gray-600 mb-6">
                    Select a conversation from the sidebar to start chatting or apply to a task to connect with other
                    users.
                  </p>
                  <Button
                    onClick={() => navigate("/tasks")}
                    className="bg-gradient-to-r from-blue-800 to-purple-400 hover:from-blue-700 hover:to-purple-500"
                  >
                    Browse Tasks
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chat
