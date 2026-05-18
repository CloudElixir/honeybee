import { motion } from 'framer-motion'
import { Sparkles, X, ArrowRight } from 'lucide-react'
import { useBooking } from '../context/BookingContext'

export function AnnouncementBar({ visible, onDismiss }) {
  const { openBooking } = useBooking()

  if (!visible) return null

  return (
    <motion.div
      className="fixed left-0 right-0 top-0 z-[110] flex h-11 items-center justify-between gap-2 bg-gradient-to-r from-honey via-amber-400 to-honey-dark px-3 text-neutral-950 sm:h-12 sm:px-4"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -48, opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label="Promotional announcement"
    >
      <span className="hidden items-center gap-1.5 rounded-full bg-black/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider sm:inline-flex">
        <Sparkles className="h-3 w-3 text-neutral-900" aria-hidden />
        Now trending
      </span>
      <p className="min-w-0 flex-1 text-center text-[11px] font-medium leading-snug sm:text-sm">
        <span className="sm:hidden">Kyoto · Amalfi · Patagonia — curated packages at best value.</span>
        <span className="hidden sm:inline">
          Kyoto · Amalfi · Patagonia — holiday packages at thoughtful prices.
        </span>
      </p>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => openBooking()}
          className="inline-flex items-center gap-1 rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-honey shadow-sm transition hover:bg-black sm:px-3 sm:text-xs"
        >
          Plan your journey
          <ArrowRight className="h-3 w-3" />
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full p-1 text-neutral-900 transition hover:bg-black/10"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  )
}
