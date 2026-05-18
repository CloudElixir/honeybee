import { useEffect, useState } from 'react'
import { BriefcaseBusiness, HandHeart, ShieldCheck, Star, Users } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { fetchReviews } from '../api/adminPublic'

const trustStats = [
  { id: 'customization', value: '100%', label: 'Trip customization', Icon: ShieldCheck },
  { id: 'concierge', value: '24x7', label: 'Concierge', Icon: HandHeart },
  { id: 'visa', value: '95%', label: 'Visa success', Icon: BriefcaseBusiness },
  { id: 'travelers', value: '150k+', label: 'Travelers', Icon: Users },
]

const demoReviews = [
  {
    id: 1,
    name: 'Ritika Sharma',
    route: 'Bali + Gili Islands',
    text: 'Team Honeybee planned every transfer so smoothly. We just enjoyed the trip without any stress.',
    rating: 4.8,
  },
  {
    id: 2,
    name: 'Aman Verma',
    route: 'Switzerland + Italy',
    text: 'Hotels were excellent, daily pacing felt perfect, and support was super quick whenever we needed help.',
    rating: 4.9,
  },
  {
    id: 3,
    name: 'Neha Iyer',
    route: 'Kerala Couple Retreat',
    text: 'Great value and premium experience. The itinerary was balanced, beautiful, and easy to follow.',
    rating: 4.7,
  },
]

export function TrustAndReviewsSection() {
  const [activeReview, setActiveReview] = useState(0)
  const [reviews, setReviews] = useState(demoReviews)

  useEffect(() => {
    let alive = true
    fetchReviews()
      .then((rows) => {
        if (!alive || !Array.isArray(rows) || rows.length === 0) return
        const mapped = rows.map((r, idx) => ({
          id: r.id ?? idx + 1,
          name: r.name || 'Guest',
          route: r.route || 'HoneyBee trip',
          text: r.text || '',
          rating: Number(r.rating || 5),
        }))
        setReviews(mapped)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveReview((prev) => (prev + 1) % reviews.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [reviews.length])

  const review = reviews[activeReview] || demoReviews[0]

  return (
    <section className="bg-white py-4 lg:py-6" aria-labelledby="trust-reviews-heading">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="p-2 text-center sm:p-3">
          <h2 id="trust-reviews-heading" className="font-display text-2xl font-semibold text-slate-900 sm:text-3xl">
            Why choose HoneybeeTrips?
          </h2>
          <p className="mt-2 text-sm text-slate-600">Minimal planning hassle. Maximum trip quality.</p>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trustStats.map(({ id, value, label, Icon }) => (
              <article key={id} className="p-3 text-center">
                <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full text-honey">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold leading-none text-honey-dark">{value}</p>
                <p className="mt-1 text-sm text-slate-600">{label}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full">
              G
            </span>
            <span className="font-semibold text-slate-900">4.8 / 5</span>
            <span>based on verified traveler reviews</span>
          </div>

          <div className="mx-auto mt-3 max-w-3xl p-4 sm:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -28 }}
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=f9a826&color=1a1200&size=96`}
                    alt={review.name}
                    loading="lazy"
                    className="h-12 w-12 flex-shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
                  />
                  <div className="mt-2 min-w-0">
                    <div className="flex items-center justify-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${i < Math.round(review.rating) ? 'fill-current' : ''}`}
                        />
                      ))}
                      <span className="ml-1 text-xs font-semibold text-slate-600">{review.rating.toFixed(1)} / 5</span>
                    </div>
                    <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">"{review.text}"</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">
                      {review.name}
                      <span className="font-normal text-honey-dark">, {review.route}</span>
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}

