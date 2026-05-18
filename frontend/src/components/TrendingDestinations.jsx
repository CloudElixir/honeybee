import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react'
import { fetchCmsItems, fetchPublic, mediaUrl } from '../api/adminPublic'
import { normalizeSlug } from '../utils/packageLocationGroups'

const GAP_PX = 16
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

const DOMESTIC_LABEL_MATCHER =
  /(india|andaman|goa|kerala|kashmir|ladakh|rajasthan|sikkim|himachal|meghalaya|uttar|varanasi|gujarat|punjab|tamil|lakshadweep|maharashtra|orissa|west bengal|arunachal|karnataka|uttarakhand|telangana|andhra|bihar|chhattisgarh|assam|nagaland|tripura|mizoram|manipur|jharkhand|madhya)/i

const recentlyBooked = [
  {
    id: 'andalusia-escape',
    traveler: 'Priya from Delhi',
    time: 'booked 2h ago',
    title: 'Andalusia Sunshine Trail',
    details: 'Spain (7N) + 2 more stops',
    price: 'INR 1,48,900',
  },
  {
    id: 'alpine-lakes',
    traveler: 'Nikhil from Pune',
    time: 'booked 4h ago',
    title: 'Swiss Alpine Lakes',
    details: 'Switzerland (6N) + 1 more stop',
    price: 'INR 1,72,400',
  },
  {
    id: 'kyoto-fuji',
    traveler: 'Rhea from Bengaluru',
    time: 'booked today',
    title: 'Kyoto and Fuji Escape',
    details: 'Japan (8N) + 2 more stops',
    price: 'INR 2,06,300',
  },
]

export function TrendingDestinations() {
  const [scope, setScope] = useState('international')
  const [cmsItems, setCmsItems] = useState([])
  const [destinations, setDestinations] = useState([])
  const scrollerRef = useRef(null)

  const items = useMemo(() => {
    const cmsMapped = (cmsItems || [])
      .filter((item) => (item.scope || 'global') === scope || (item.scope || 'global') === 'global')
      .map((item) => ({
        label: item.title,
        image: mediaUrl(item.image_url) || FALLBACK_IMAGE,
        to: item.link_url?.trim() || '/destinations',
      }))
      .filter((x) => x.label)

    if (cmsMapped.length > 0) return cmsMapped

    const rows = Array.isArray(destinations) ? destinations : []
    const filtered = rows.filter((d) => {
      const label = `${d.name || ''} ${d.country || ''}`
      const isDomestic = DOMESTIC_LABEL_MATCHER.test(label)
      return scope === 'domestic' ? isDomestic : !isDomestic
    })

    return filtered.slice(0, 10).map((d) => {
      const paths = Array.isArray(d.image_paths) ? d.image_paths : []
      const img = mediaUrl(d.cover_image) || mediaUrl(paths[0]) || FALLBACK_IMAGE
      const slug = normalizeSlug(d.slug || d.name || d.id)
      return {
        label: String(d.name || d.country || 'Destination').trim(),
        image: img,
        to: `/destinations/${slug}`,
      }
    })
  }, [cmsItems, destinations, scope])

  useEffect(() => {
    let alive = true
    fetchCmsItems('trending_destinations')
      .then((rows) => {
        if (!alive) return
        setCmsItems(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setCmsItems([])
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetchPublic('destinations')
      .then((rows) => {
        if (!alive) return
        setDestinations(Array.isArray(rows) ? rows : [])
      })
      .catch((e) => {
        if (import.meta.env.DEV) console.warn('[TrendingDestinations] destinations', e)
        if (!alive) return
        setDestinations([])
      })
    return () => {
      alive = false
    }
  }, [])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-trend-card]')
    const step = (card?.offsetWidth ?? 280) + GAP_PX
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollLeft = 0
  }, [scope])

  return (
    <section
      className="bg-neutral-50 py-16 lg:py-24"
      aria-labelledby="trending-destinations-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2
              id="trending-destinations-heading"
              className="font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Where to next
            </h2>
            <p className="mt-2 text-base text-slate-600 sm:text-lg">
              A tight shortlist of destinations with great momentum right now.
            </p>
          </div>

          <div
            className="inline-flex shrink-0 rounded-full bg-white p-1 shadow-sm ring-1 ring-black/5"
            role="group"
            aria-label="Destination region"
          >
            <button
              type="button"
              onClick={() => setScope('international')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6 ${
                scope === 'international'
                  ? 'bg-neutral-900 text-honey shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              International
            </button>
            <button
              type="button"
              onClick={() => setScope('domestic')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6 ${
                scope === 'domestic'
                  ? 'bg-neutral-900 text-honey shadow-sm'
                  : 'text-neutral-700 hover:text-neutral-900'
              }`}
            >
              Domestic
            </button>
          </div>
        </div>

        {items.length === 0 && (
          <p className="mt-8 rounded-2xl border border-dashed border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-600">
            No trending destinations for this tab yet. Add CMS items (section “trending_destinations”) or create destinations in admin — they appear here automatically.
          </p>
        )}

        {/* Desktop: editorial grid */}
        <div className="mt-10 hidden md:block">
          <div className="grid gap-5 md:grid-cols-12">
            {items.slice(0, 6).map((item, i) => {
              const span =
                i === 0 ? 'md:col-span-5 md:row-span-2' : i === 1 ? 'md:col-span-4' : 'md:col-span-3'
              const height = i === 0 ? 'min-h-[420px]' : 'min-h-[200px]'
              return (
                <Link
                  key={`${scope}-grid-${item.label}`}
                  to={item.to}
                  className={`group relative overflow-hidden rounded-3xl border border-neutral-200 bg-black shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 ${span} ${height}`}
                >
                  <img
                    src={item.image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <div className="absolute inset-0 opacity-0 transition group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.18),_transparent_55%)]" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/80">Trending</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-white">{item.label}</p>
                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-honey px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-neutral-900 opacity-0 transition group-hover:opacity-100">
                      Explore
                      <ArrowUpRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm md:mt-10 md:p-5">
          <div className="grid gap-4 md:grid-cols-12 md:items-stretch">
            <div className="rounded-2xl bg-neutral-50 p-5 md:col-span-3 md:p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Freshly Reserved
              </p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900 md:text-3xl">
                New itinerary picks
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                Plans travelers locked in recently. Great for quick inspiration.
              </p>
            </div>

            <div className="md:col-span-9">
              <div className="grid gap-3 md:grid-cols-3">
                {recentlyBooked.map((trip) => (
                  <article
                    key={trip.id}
                    className="rounded-2xl border border-neutral-200 bg-white p-4 ring-1 ring-black/5"
                  >
                    <p className="text-[11px] font-medium text-slate-500">
                      {trip.traveler} - {trip.time}
                    </p>
                    <h4 className="mt-2 text-base font-semibold text-slate-900">{trip.title}</h4>
                    <p className="mt-1 text-xs text-slate-600">{trip.details}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900">{trip.price}</p>
                      <Link
                        to="/destinations"
                        className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        See plan
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: horizontal scroll */}
        <div className="relative mt-10 md:hidden">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-md transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Previous destinations"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-md transition hover:bg-neutral-100 hover:text-neutral-900"
            aria-label="Next destinations"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div
            ref={scrollerRef}
            className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-1 pt-1"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              {items.map((item) => (
                <motion.div
                  key={`${scope}-${item.label}`}
                  data-trend-card
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                  className="relative h-[200px] w-[min(260px,80vw)] shrink-0 snap-start"
                >
                  <Link
                    to={item.to}
                    className="group relative block h-full w-full overflow-hidden rounded-3xl border border-neutral-200 bg-black shadow-sm ring-1 ring-black/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2"
                  >
                    <img
                      src={item.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-1 text-xs text-white/70">Tap to explore</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mt-4 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-700 shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            to="/destinations"
            className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-8 py-3.5 text-sm font-semibold text-honey shadow-md transition hover:bg-black sm:px-10 sm:text-base"
          >
            Browse all destinations
          </Link>
        </div>
      </div>
    </section>
  )
}
