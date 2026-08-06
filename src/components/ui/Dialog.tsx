import * as React from "react"
import { cn } from "../../utils/utils"
import { motion, AnimatePresence } from "framer-motion"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Dialog({ isOpen, onClose, children }: DialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm" 
            onClick={onClose}
          />
          {/* Dialog Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative z-50 w-full max-w-lg"
          >
            <div className="bg-[#181c20]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden text-white">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export function DialogHeader({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("px-6 py-4 border-b border-white/10", className)}>
      {children}
    </div>
  )
}

export function DialogTitle({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <h3 className={cn("text-lg font-semibold text-white", className)}>
      {children}
    </h3>
  )
}

export function DialogContent({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  )
}

export function DialogFooter({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("px-6 py-4 bg-white/5 flex justify-end space-x-2 border-t border-white/10", className)}>
      {children}
    </div>
  )
}
