"use client"

import { createContext, useContext, useState } from "react"
import { X } from "lucide-react"

const ToastContext = createContext({})

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const toast = ({ title, description, variant = "default", duration = 5000 }) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast = { id, title, description, variant, duration }

    setToasts((prevToasts) => [...prevToasts, newToast])

    // Auto dismiss
    setTimeout(() => {
      dismissToast(id)
    }, duration)

    return id
  }

  const dismissToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast, dismissToast }}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4 w-full max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-lg border p-4 shadow-md transition-all animate-in slide-in-from-right-full ${
              toast.variant === "destructive" ? "bg-red-50 border-red-200 text-red-900" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex justify-between items-start gap-2">
              <div>
                {toast.title && <div className="font-medium">{toast.title}</div>}
                {toast.description && <div className="text-sm text-gray-500 mt-1">{toast.description}</div>}
              </div>
              <button
                onClick={() => dismissToast(toast.id)}
                className="rounded-md p-1 text-gray-400 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)

  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}

export const toast = (props) => {
  const { toast: toastFn } = useToast()
  return toastFn(props)
}
