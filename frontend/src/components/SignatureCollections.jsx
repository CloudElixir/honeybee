import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ArrowRight,
  Trophy,
  Sparkles,
  Stamp,
  Wallet,
  Gem,
} from 'lucide-react'
import { fetchCmsItems, fetchPublic, mediaUrl } from '../api/adminPublic'

const GAP_PX = 16
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

const BADGE_META = {
  signature: { label: 'Handpicked', Icon: Trophy, barClass: 'bg-rose-500 text-white' },
  hot: { label: 'Hot right now', Icon: Sparkles, barClass: 'bg-amber-800 text-white' },
  visaFree: { label: 'Visa-free escape', Icon: Stamp, barClass: 'bg-emerald-600 text-white' },
  value: { label: 'Smart value', Icon: Wallet, barClass: 'bg-sky-700 text-white' },
  hidden: { label: 'Hidden gem', Icon: Gem, barClass: 'bg-violet-600 text-white' },
}
const EMERGENCY_CARDS = [
  {
    id: 'em-1',
    tags: ['signature'],
    badge: 'signature',
    country: 'CURATED',
    duration: '6D / 5N',
    name: 'Signature coastal escape',
    price: 1499,
    image: FALLBACK_IMAGE,
    to: '/packages',
  },
]

function formatDuration(duration) {
  // Supports strings like "4D / 3N" or "5D/4N"
  const m = String(duration).match(/(\d+)\s*D\s*\/\s*(\d+)\s*N/i)
  if (!m) return duration
  const days = Number(m[1])
  const nights = Number(m[2])
  const dLabel = days === 1 ? 'day' : 'days'
  const nLabel = nights === 1 ? 'night' : 'nights'
  return `${days} ${dLabel} • ${nights} ${nLabel}`
}

export function SignatureCollections({ title = 'Curated spotlight escapes', subtitle }) {
  const [scope, setScope] = useState('international')
  const [activeFilter, setActiveFilter] = useState('signature')
  const [cmsItems, setCmsItems] = useState(null)
  const [packages, setPackages] = useState([])
  const scrollerRef = useRef(null)
  const [autoPlay, setAutoPlay] = useState(true)
  const lastUserActionRef = useRef(Date.now())

  useEffect(() => {
    let alive = true
    fetchCmsItems('signature')
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
    fetchPublic('packages')
      .then((rows) => {
        if (!alive) return
        setPackages(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  const dynamicByScope = useMemo(() => {
    const list = (cmsItems || [])
      .filter((item) => (item.scope || 'global') === scope || (item.scope || 'global') === 'global')
      .map((item) => ({
        id: item.id,
        tags: String(item.tags || '')
          .split(',')
          .map((v) => v.trim())
          .filter(Boolean),
        badge: item.badge || 'signature',
        country: item.subtitle || 'CURATED',
        duration: item.duration || 'Custom',
        name: item.title,
        price: Number(item.price || 0),
        image: mediaUrl(item.image_url) || FALLBACK_IMAGE,
        to: item.link_url || '/packages',
      }))
    return list
  }, [cmsItems, scope])

  const packageFallback = useMemo(
    () => {
      const all = (packages || [])
      const scoped = all.filter((p) =>
        scope === 'domestic'
          ? String(p.category || '').toLowerCase().includes('domestic')
          : !String(p.category || '').toLowerCase().includes('domestic')
      )
      const base = scoped.length > 0 ? scoped : all
      return base.slice(0, 12).map((p) => ({
          id: p.id,
          tags: ['signature'],
          badge: p.is_trending ? 'hot' : p.is_curated ? 'signature' : 'value',
          country: p.location || 'CURATED',
          duration: p.duration || 'Custom',
          name: p.title || 'Untitled package',
          price: Number(p.price || 0),
          image:
            mediaUrl(p.image_path) ||
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          to: `/packages/${String(p.slug || p.title || p.id)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')}`,
        }))
    },
    [packages, scope]
  )

  const pool = dynamicByScope.length > 0 ? dynamicByScope : packageFallback.length > 0 ? packageFallback : EMERGENCY_CARDS
  const availableFilters = useMemo(() => {
    const set = new Set()
    pool.forEach((p) => (p.tags || []).forEach((tag) => set.add(tag)))
    if (set.size === 0) set.add('signature')
    return Array.from(set).map((id) => ({
      id,
      label: String(id).replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()),
    }))
  }, [pool])

  useEffect(() => {
    if (!availableFilters.find((f) => f.id === activeFilter)) {
      setActiveFilter(availableFilters[0]?.id || 'signature')
    }
  }, [availableFilters, activeFilter])

  const filtered = useMemo(() => {
    const byTag = pool.filter((p) => p.tags.includes(activeFilter))
    return byTag.length > 0 ? byTag : pool
  }, [pool, activeFilter])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-signature-card]')
    const step = (card?.offsetWidth ?? 300) + GAP_PX
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollLeft = 0
  }, [scope, activeFilter])

  useEffect(() => {
    if (!autoPlay) return undefined
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return undefined

    const id = window.setInterval(() => {
      // pause briefly after any user interaction
      if (Date.now() - lastUserActionRef.current < 2500) return
      scrollByDir(1)
    }, 3200)
    return () => window.clearInterval(id)
  }, [autoPlay, scrollByDir])

  const markUserAction = () => {
    lastUserActionRef.current = Date.now()
  }

  return (
    <section
      className="relative bg-white py-16 lg:py-24"
      aria-labelledby="signature-collections-heading"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.28] hb-flight-bg" />
        <div className="absolute -top-10 left-0 h-40 w-full bg-gradient-to-b from-white via-white/70 to-transparent" />
        <div className="absolute -bottom-10 left-0 h-40 w-full bg-gradient-to-t from-white via-white/70 to-transparent" />
        <svg
          className="hb-plane absolute left-0 top-24 h-6 w-6 text-neutral-900/60"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2.5 19.5l8.6-3.2 3.3 3.2 1.7-.7-2.2-4.2 4.7-1.8c1.6-.6 2.4-2.3 1.8-3.9-.6-1.6-2.3-2.4-3.9-1.8L12 8.9 7.8 6.7 7.1 8.4l3.2 3.3-3.2 8.6 1.4-.8 2.2-4.8 3.1 3.1 1.1-.4-2.6-4.9 4.9-2.6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <h2
              id="signature-collections-heading"
              className="font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              {title}
            </h2>
            <p className="mt-2 text-base text-slate-500 sm:text-lg">
              {subtitle || 'Distinct journey sets with bold moods, handpicked stays, and smoother day-by-day flow.'}
            </p>
          </div>

          <div
            className="inline-flex shrink-0 rounded-full bg-slate-200/90 p-1 shadow-inner"
            role="group"
            aria-label="Package region"
          >
            <button
              type="button"
              onClick={() => setScope('international')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6 ${
                scope === 'international'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-blue-900 hover:text-blue-950'
              }`}
            >
              International
            </button>
            <button
              type="button"
              onClick={() => setScope('domestic')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition sm:px-6 ${
                scope === 'domestic'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-blue-900 hover:text-blue-950'
              }`}
            >
              Domestic
            </button>
          </div>
        </div>

        <div
          className="mt-8 flex flex-wrap gap-2 sm:mt-10 sm:gap-3"
          role="tablist"
          aria-label="Collection categories"
        >
          {availableFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={activeFilter === f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                activeFilter === f.id
                  ? 'bg-honey text-neutral-900 shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-14 text-center text-slate-600">
            No packages in this view yet — try another collection tab.
          </p>
        ) : (
          <div className="relative mt-8 md:mt-10">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11"
              aria-label="Previous packages"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11"
              aria-label="Next packages"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <div
              ref={scrollerRef}
              className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-1 pt-1 md:mx-0 md:px-12"
              onMouseEnter={() => setAutoPlay(false)}
              onMouseLeave={() => setAutoPlay(true)}
              onTouchStart={() => {
                setAutoPlay(false)
                markUserAction()
              }}
              onScroll={markUserAction}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((pkg) => {
                  const meta = BADGE_META[pkg.badge] ?? BADGE_META.signature
                  const Icon = meta.Icon
                  return (
                    <motion.div
                      key={`${scope}-${activeFilter}-${pkg.id}`}
                      data-signature-card
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="relative h-[400px] w-[min(300px,calc(100vw-3rem))] shrink-0 snap-start sm:h-[420px] sm:w-[min(320px,calc(50vw-1.5rem))] md:h-[440px] lg:h-[460px] lg:w-[calc((100%-3*1rem)/4)] lg:max-w-none"
                    >
                      <Link
                        to={pkg.to}
                        className="group relative flex h-full w-full flex-col overflow-hidden rounded-[26px] bg-slate-900 shadow-lg ring-1 ring-black/5 transition-all duration-300 hover:rounded-[42px_18px_42px_18px] focus:outline-none focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2"
                        onFocus={() => {
                          setAutoPlay(false)
                          markUserAction()
                        }}
                        onBlur={() => {
                          setAutoPlay(true)
                          markUserAction()
                        }}
                      >
                        <div className="pointer-events-none absolute -inset-6 z-0 rounded-full bg-honey/0 blur-2xl transition-all duration-300 group-hover:bg-honey/25" />
                        <img
                          src={pkg.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110 group-hover:rotate-[1deg]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

                        <div className="relative z-10 flex items-start justify-between p-3 sm:p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide sm:text-xs ${meta.barClass}`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            {meta.label}
                          </span>
                        </div>

                        <div className="relative z-10 mt-auto p-3 sm:p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:text-xs">
                              <MapPin className="h-3.5 w-3.5 text-honey" strokeWidth={2} />
                              {pkg.country}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-semibold text-white shadow-sm backdrop-blur-sm sm:text-xs">
                              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                              {formatDuration(pkg.duration)}
                            </span>
                          </div>
                          <h3 className="mt-3 font-sans text-lg font-bold leading-snug text-white sm:text-xl">
                            {pkg.name}
                          </h3>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="text-xl font-bold text-white sm:text-2xl">
                              <span className="text-sm font-semibold text-white/70">from </span>$
                              {pkg.price.toLocaleString()}
                              <span className="text-sm font-medium text-white/70"> / person</span>
                            </p>
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px_22px_12px_22px] bg-white text-neutral-900 shadow-md transition-all duration-300 group-hover:rounded-[22px_12px_22px_12px] group-hover:bg-honey"
                              aria-hidden
                            >
                              <ArrowRight className="h-5 w-5" strokeWidth={2} />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            <div className="mt-4 flex justify-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => scrollByDir(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByDir(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            to="/packages"
            className="inline-flex items-center justify-center rounded-full bg-blue-700 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-blue-800 sm:px-10 sm:text-base"
          >
            View all packages
          </Link>
        </div>
      </div>
    </section>
  )
}
