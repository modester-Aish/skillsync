import React from "react"

export const Button = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-blue-500 text-white hover:bg-blue-700 h-10 py-2 px-4 ${className}`}
      {...props}
      ref={ref}
    >
      {children}
    </button>
  )
})
Button.displayName = "Button"
