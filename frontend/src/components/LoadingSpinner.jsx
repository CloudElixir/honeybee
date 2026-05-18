import { motion, AnimatePresence } from 'framer-motion'

export function LoadingSpinner({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="status"
          aria-live="polite"
          aria-label="Loading"
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="h-14 w-14 rounded-full border-2 border-neutral-200 border-t-honey border-r-gold"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            />
            <p className="font-display text-xl text-neutral-800 tracking-wide">HoneybeeTrips</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
