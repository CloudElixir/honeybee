import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'

const WHATSAPP =
  'https://wa.me/15551234567?text=Hi%20HoneybeeTrips%20Assistant%2C%20I%20have%20a%20question%20about%20planning%20a%20trip.'

export function HomeAssistantBubble() {
  return (
    <motion.a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="group absolute bottom-24 right-4 z-20 flex max-w-[220px] items-start gap-3 rounded-2xl border border-white/25 bg-black/45 px-3 py-2.5 shadow-lg backdrop-blur-md sm:bottom-28 sm:right-8 sm:max-w-xs sm:px-4 sm:py-3"
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.02 }}
    >
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-honey to-amber-500 text-neutral-900 shadow-md">
        <MessageCircle className="h-4 w-4" strokeWidth={2} />
      </span>
      <div className="min-w-0 text-left">
        <p className="text-xs font-semibold text-white">Honeybee Assistant</p>
        <p className="mt-0.5 text-[11px] leading-snug text-white/85 sm:text-xs">
          How can we help you plan today?
        </p>
      </div>
    </motion.a>
  )
}
