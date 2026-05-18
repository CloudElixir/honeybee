import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

const WHATSAPP = 'https://wa.me/15551234567?text=Hi%20HoneybeeTrips%2C%20I%27d%20love%20help%20planning%20a%20trip.'

export function WhatsAppFloat({ hideOnHome = false }) {
  const { pathname } = useLocation()
  if (hideOnHome && pathname === '/') return null

  return (
    <motion.a
      href={WHATSAPP}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-card hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.8 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.96 }}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" strokeWidth={1.75} />
    </motion.a>
  )
}
