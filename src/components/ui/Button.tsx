import * as React from "react"
import { cn } from "../../utils/utils"
import { motion } from "framer-motion"
import type { HTMLMotionProps } from "framer-motion"

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "ref"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden relative",
          {
            "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg hover:shadow-indigo-500/25 border border-indigo-500/50": variant === "default",
            "bg-red-500/80 text-white hover:bg-red-600 shadow-md border border-red-500/50": variant === "destructive",
            "border border-white/10 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 shadow-sm": variant === "outline",
            "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm": variant === "secondary",
            "hover:bg-white/10 text-gray-300 hover:text-white": variant === "ghost",
            "text-indigo-400 underline-offset-4 hover:underline": variant === "link",
            "bg-white/5 border border-white/10 text-white hover:bg-white/10": variant === "glass",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-12 rounded-xl px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
