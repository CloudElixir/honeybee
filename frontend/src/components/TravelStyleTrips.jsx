import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  ArrowRight,
  Coins,
  Trophy,
  Sparkles,
} from 'lucide-react'
import { travelStyleCategories, travelStyleFilters } from '../data/travelStyleTrips'

const GAP_PX = 16

const IMG_ERROR_SAFE =
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=82'

function TravelStyleCardImage({ primary, fallback }) {
  return (
    <img
      src={primary}
      alt=""
      loading="lazy"
      decoding="async"
      data-phase="0"
      className="absolute inset-0 z-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-105"
      onError={(e) => {
        const el = e.currentTarget
        const phase = el.dataset.phase
        if (phase === '0' && fallback) {
          el.dataset.phase = '1'
          el.src = fallback
        } else if (phase !== '2') {
          el.dataset.phase = '2'
          el.src = IMG_ERROR_SAFE
        }
      }}
    />
  )
}

/** Soft color mesh over card photos (pointer-events none — whole card stays one link). */
const CARD_MESH_STYLE = {
  background: `
    radial-gradient(at 18% 22%, rgba(251, 191, 36, 0.32) 0px, transparent 55%),
    radial-gradient(at 82% 18%, rgba(59, 130, 246, 0.28) 0px, transparent 52%),
    radial-gradient(at 70% 82%, rgba(244, 114, 182, 0.22) 0px, transparent 50%),
    radial-gradient(at 12% 78%, rgba(45, 212, 191, 0.2) 0px, transparent 48%),
    radial-gradient(at 50% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 65%)
  `,
}

const BADGE_META = {
  valueChoice: {
    label: 'Value choice',
    Icon: Coins,
    barClass: 'bg-blue-600 text-white',
  },
  signaturePick: {
    label: 'Handpicked',
    Icon: Trophy,
    barClass: 'bg-rose-500 text-white',
  },
  hotRightNow: {
    label: 'Hot right now',
    Icon: Sparkles,
    barClass: 'bg-orange-500 text-white',
  },
  beachHolidays: {
    label: 'Style pick',
    Icon: MapPin,
    barClass: 'bg-violet-600 text-white',
  },
}

export function TravelStyleTrips() {
  const [activeFilter, setActiveFilter] = useState(null)
  const scrollerRef = useRef(null)
  const filterScrollRef = useRef(null)
  const [filterCanPrev, setFilterCanPrev] = useState(false)
  const [filterCanNext, setFilterCanNext] = useState(false)

  const filtered = useMemo(() => {
    if (activeFilter == null) return travelStyleCategories
    return travelStyleCategories.filter((c) => c.id === activeFilter)
  }, [activeFilter])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-style-card]')
    const step = (card?.offsetWidth ?? 280) + GAP_PX
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  const updateFilterScrollState = useCallback(() => {
    const el = filterScrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setFilterCanPrev(scrollLeft > 2)
    setFilterCanNext(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  const scrollFilterByDir = useCallback((dir) => {
    const el = filterScrollRef.current
    if (!el) return
    const step = Math.max(200, Math.floor(el.clientWidth * 0.65))
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = filterScrollRef.current
    if (!el) return
    updateFilterScrollState()
    const onScroll = () => updateFilterScrollState()
    el.addEventListener('scroll', onScroll, { passive: true })
    const ro = new ResizeObserver(() => updateFilterScrollState())
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', onScroll)
      ro.disconnect()
    }
  }, [updateFilterScrollState])

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollLeft = 0
  }, [activeFilter])

  return (
    <motion.section
      className="relative overflow-hidden bg-slate-50 py-16 lg:py-24"
      aria-labelledby="travel-style-heading"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          background: `
            radial-gradient(at 20% 30%, rgba(251, 191, 36, 0.2) 0px, transparent 50%),
            radial-gradient(at 80% 20%, rgba(59, 130, 246, 0.18) 0px, transparent 45%),
            radial-gradient(at 75% 75%, rgba(167, 139, 250, 0.15) 0px, transparent 50%)
          `,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2
            id="travel-style-heading"
            className="font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
          >
            Choose how you want to travel
          </h2>
          <p className="mt-2 text-base text-slate-500 sm:text-lg">
            Browse by mood, then open a style to see journeys we curate for that spirit.
          </p>
        </div>

        <div className="relative mt-8 sm:mt-10">
          <button
            type="button"
            onClick={() => scrollFilterByDir(-1)}
            disabled={!filterCanPrev}
            className={`absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11 ${
              !filterCanPrev ? 'pointer-events-none opacity-35' : ''
            }`}
            aria-label="Scroll categories left"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => scrollFilterByDir(1)}
            disabled={!filterCanNext}
            className={`absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11 ${
              !filterCanNext ? 'pointer-events-none opacity-35' : ''
            }`}
            aria-label="Scroll categories right"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
          </button>

          <div
            ref={filterScrollRef}
            className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto pb-2 pl-1 pr-1 pt-1 sm:gap-3 md:mx-0 md:px-12"
            role="tablist"
            aria-label="Travel style categories"
          >
            {travelStyleFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                role="tab"
                aria-selected={activeFilter === f.id}
                onClick={() => setActiveFilter((prev) => (prev === f.id ? null : f.id))}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                  activeFilter === f.id
                    ? 'bg-honey text-neutral-900 shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="mt-2 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollFilterByDir(-1)}
              disabled={!filterCanPrev}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm ${
                !filterCanPrev ? 'opacity-35' : ''
              }`}
              aria-label="Scroll categories left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollFilterByDir(1)}
              disabled={!filterCanNext}
              className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm ${
                !filterCanNext ? 'opacity-35' : ''
              }`}
              aria-label="Scroll categories right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-10 rounded-3xl border border-dashed border-slate-200 bg-white py-14 text-center text-slate-600">
            Nothing in this style yet — try another category.
          </p>
        ) : (
          <div className="relative mt-8 md:mt-10">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11"
              aria-label="Previous styles"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:bg-slate-50 hover:text-slate-900 md:flex lg:h-11 lg:w-11"
              aria-label="Next styles"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>

            <div
              ref={scrollerRef}
              className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pl-1 pr-1 pt-1 md:mx-0 md:px-12"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {filtered.map((cat) => {
                  const meta = BADGE_META[cat.badge] ?? BADGE_META.valueChoice
                  const Icon = meta.Icon
                  const to =
                    cat.themePath || `/packages?travelStyle=${encodeURIComponent(cat.id)}`
                  return (
                    <motion.div
                      key={`${activeFilter ?? 'all'}-${cat.id}`}
                      data-style-card
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.22 }}
                      className="w-[min(260px,calc(100vw-3rem))] shrink-0 snap-start sm:w-[min(280px,calc(50vw-1.5rem))] lg:w-[calc((100%-3*1rem)/4)] lg:max-w-none"
                    >
                      <Link
                        to={to}
                        aria-label={`Explore ${cat.label}`}
                        className="group relative flex aspect-[3/4] w-full flex-col overflow-hidden rounded-3xl bg-slate-900 shadow-lg ring-1 ring-black/5 transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
                      >
                        <TravelStyleCardImage primary={cat.image} fallback={cat.imageFallback} />
                        <div
                          className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light opacity-75 transition-opacity duration-500 group-hover:opacity-90"
                          style={CARD_MESH_STYLE}
                          aria-hidden
                        />
                        <div className="absolute inset-0 z-[2] bg-gradient-to-t from-black/80 via-black/28 to-black/10" />

                        <div className="relative z-10 flex items-start p-3 sm:p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:text-[11px] ${meta.barClass}`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            {meta.label}
                          </span>
                        </div>

                        <div className="relative z-10 mt-auto space-y-3 p-3 sm:p-4">
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex max-w-[55%] items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-xs">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-honey" strokeWidth={2} />
                              CURATED
                            </span>
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm sm:text-xs">
                              <Clock className="h-3.5 w-3.5" strokeWidth={2} />
                              Flexible
                            </span>
                          </div>
                          <h3 className="line-clamp-2 font-sans text-base font-bold leading-snug text-white sm:text-lg">
                            {cat.label}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-snug text-white/85">{cat.tagline}</p>
                          <div className="flex items-end justify-end gap-2 pt-1">
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-neutral-900 shadow-md transition group-hover:bg-honey sm:h-11 sm:w-11"
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
      </div>
    </motion.section>
  )
}
