import { motion } from 'framer-motion'
import {
  Award,
  Globe,
  Headphones,
  MapPin,
  ShieldCheck,
  Sparkles,
  Tag,
  Users,
} from 'lucide-react'

const TRUST_ITEMS = [
  { Icon: ShieldCheck, title: '100%', subtitle: 'Secure booking' },
  { Icon: Award, title: '8+', subtitle: 'Years experience' },
  { Icon: Users, title: '25K+', subtitle: 'Happy travelers' },
  { Icon: Headphones, title: '24/7', subtitle: 'Support available' },
  { Icon: Tag, title: 'Best price', subtitle: 'Guaranteed' },
  { Icon: Sparkles, title: 'Personalized', subtitle: 'Customized trips' },
  { Icon: MapPin, title: 'Expert', subtitle: 'Local guides' },
  { Icon: Globe, title: '100+', subtitle: 'Destinations covered' },
]

/**
 * Bayard-style trust grid — branded for HoneyBee Trips.
 */
export function WhyChooseHoneybeeTripsSection({ className = '' }) {
  return (
    <motion.section
      id="lux-why-choose"
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5 }}
      className={`scroll-mt-24 rounded-3xl border border-slate-200/80 bg-gradient-to-b from-slate-50 via-white to-amber-50/40 px-6 py-12 shadow-sm sm:px-10 sm:py-14 ${className}`}
      aria-labelledby="why-choose-honeybee-heading"
    >
      <h2
        id="why-choose-honeybee-heading"
        className="text-center font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl"
      >
        Why Choose{' '}
        <span className="relative inline-block text-lux-gold">
          HoneyBee Trips
          <span
            className="absolute -bottom-1 left-0 right-0 h-1 rounded-full bg-lux-gold/90"
            aria-hidden
          />
        </span>
        ?
      </h2>

      <ul className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10">
        {TRUST_ITEMS.map(({ Icon, title, subtitle }, i) => (
          <motion.li
            key={subtitle}
            initial={false}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, duration: 0.35 }}
            className="flex items-center gap-4"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-amber-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ring-1 ring-amber-100/80">
              <Icon className="h-7 w-7 text-lux-gold" strokeWidth={1.5} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-sans text-xl font-bold leading-tight text-slate-900 sm:text-2xl">{title}</p>
              <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {subtitle}
              </p>
            </div>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  )
}
