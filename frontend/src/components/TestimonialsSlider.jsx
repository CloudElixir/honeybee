import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const items = [
  {
    quote:
      'HoneybeeTrips choreographed our honeymoon without a single hiccup. The pacing felt luxurious — never rushed.',
    name: 'Elena & Marco',
    trip: 'Santorini & Athens',
  },
  {
    quote:
      'I travel often for work; this was the first time a leisure trip felt truly restorative. The concierge was exceptional.',
    name: 'James Chen',
    trip: 'Kyoto Heritage',
  },
  {
    quote:
      'They listened to our family’s chaos-level and built an itinerary our teens actually loved. Worth every penny.',
    name: 'The Okonkwo family',
    trip: 'Costa Rica',
  },
]

export function TestimonialsSlider() {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % items.length), 7000)
    return () => clearInterval(t)
  }, [])

  const prev = () => setI((v) => (v - 1 + items.length) % items.length)
  const next = () => setI((v) => (v + 1) % items.length)

  return (
    <div className="relative mx-auto max-w-3xl">
      <Quote className="absolute -left-2 -top-4 h-12 w-12 text-honey/30 sm:-left-6" aria-hidden />
      <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white px-6 py-10 shadow-soft sm:px-12 sm:py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35 }}
            className="text-center"
          >
            <p className="font-display text-xl leading-relaxed text-neutral-800 sm:text-2xl">
              “{items[i].quote}”
            </p>
            <p className="mt-6 text-sm font-semibold text-neutral-900">{items[i].name}</p>
            <p className="text-xs uppercase tracking-widest text-gold">{items[i].trip}</p>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="mt-6 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={prev}
          className="rounded-full border border-neutral-200 p-2 text-neutral-700 transition hover:border-honey hover:bg-honey/10"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex gap-1.5">
          {items.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setI(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === i ? 'w-8 bg-honey' : 'w-2 bg-neutral-300 hover:bg-neutral-400'
              }`}
              aria-label={`Go to testimonial ${idx + 1}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={next}
          className="rounded-full border border-neutral-200 p-2 text-neutral-700 transition hover:border-honey hover:bg-honey/10"
          aria-label="Next testimonial"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
