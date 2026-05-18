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
  Landmark,
  Mountain,
  Waves,
  Snowflake,
} from 'lucide-react'
import { fetchCmsItems, fetchPublic, mediaUrl } from '../api/adminPublic'

const GAP_PX = 16

const EUROPE_RE =
  /europe|european|schengen|continental|eu\b|paris|london|rome|madrid|barcelona|berlin|munich|amsterdam|rotterdam|brussels|vienna|prague|budapest|lisbon|porto|athens|santorini|mykonos|dublin|edinburgh|glasgow|oslo|bergen|stockholm|copenhagen|helsinki|reykjavik|iceland|zurich|geneva|interlaken|lucerne|milan|venice|florence|tuscany|amalfi|nice|cannes|monaco|dubrovnik|split|ljubljana|warsaw|krakow|gdansk|tallinn|riga|vilnius|bucharest|sofia|belgrade|tirana|malta|valletta|cyprus|istanbul|turkey|alps|alpine|swiss|scandi|nordic|baltic|mediterranean|adriatic|tyrol|dolomites|pyrenees|france|italy|spain|portugal|greece|germany|netherlands|holland|belgium|austria|switzerland|united kingdom|england|scotland|wales|ireland|norway|sweden|finland|denmark|poland|czech|slovakia|hungary|croatia|slovenia|romania|bulgaria|serbia|montenegro|bosnia|albania|north macedonia|estonia|latvia|lithuania/i

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=1400&q=82'

const SHOWCASE_FALLBACK = [
  {
    id: 'eu-fb-1',
    tags: ['capitals'],
    badge: 'signature',
    country: 'France',
    duration: '5D / 4N',
    name: 'Paris & the Île-de-France rhythm',
    price: 1899,
    image:
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=82',
    to: '/packages',
  },
  {
    id: 'eu-fb-2',
    tags: ['alps'],
    badge: 'signature',
    country: 'Switzerland',
    duration: '6D / 5N',
    name: 'Swiss Alps — peaks, lakes & slow trains',
    price: 2499,
    image:
      'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=82',
    to: '/packages',
  },
  {
    id: 'eu-fb-3',
    tags: ['mediterranean'],
    badge: 'hot',
    country: 'Italy',
    duration: '7D / 6N',
    name: 'Amalfi Coast golden hour escapes',
    price: 2199,
    image:
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=82',
    to: '/packages',
  },
  {
    id: 'eu-fb-4',
    tags: ['nordic'],
    badge: 'hidden',
    country: 'Iceland',
    duration: '5D / 4N',
    name: 'Nordic light — fjords & midnight sun',
    price: 2799,
    image:
      'https://images.unsplash.com/photo-1476610182048-b716b8518aae?auto=format&fit=crop&w=1200&q=82',
    to: '/packages',
  },
]

const REGION_TABS = [
  { id: 'all', label: 'All Europe', Icon: Landmark, test: () => true },
  {
    id: 'capitals',
    label: 'Capitals & culture',
    Icon: Landmark,
    test: (s) =>
      /paris|london|rome|madrid|berlin|amsterdam|vienna|prague|budapest|lisbon|dublin|edinburgh|brussels|stockholm|copenhagen|oslo|athens|warsaw|krakow|capital|museum|gallery|palace/i.test(
        s
      ),
  },
  {
    id: 'alps',
    label: 'Alps & peaks',
    Icon: Mountain,
    test: (s) =>
      /alps|alpine|swiss|zurich|geneva|interlaken|tyrol|dolomites|innsbruck|chamonix|zermatt|mountain|peak|hiking/i.test(
        s
      ),
  },
  {
    id: 'mediterranean',
    label: 'Mediterranean',
    Icon: Waves,
    test: (s) =>
      /mediterranean|amalfi|santorini|mykonos|barcelona|nice|cannes|adriatic|dubrovnik|coast|sea|island|sicily|portugal|spain|italy|greece|croatia/i.test(
        s
      ),
  },
  {
    id: 'nordic',
    label: 'Nordic & Baltic',
    Icon: Snowflake,
    test: (s) =>
      /nordic|scandi|iceland|norway|sweden|finland|denmark|baltic|tallinn|riga|vilnius|reykjavik|fjord|aurora/i.test(
        s
      ),
  },
]

const BADGE_META = {
  signature: { label: 'Handpicked', Icon: Trophy, barClass: 'bg-rose-500 text-white' },
  hot: { label: 'Hot right now', Icon: Sparkles, barClass: 'bg-amber-500 text-neutral-900' },
  visaFree: { label: 'Visa-smart', Icon: Sparkles, barClass: 'bg-emerald-500 text-white' },
  value: { label: 'Smart value', Icon: Sparkles, barClass: 'bg-sky-600 text-white' },
  hidden: { label: 'Hidden gem', Icon: Sparkles, barClass: 'bg-violet-500 text-white' },
}

function haystackFromPackage(p) {
  return `${p.title || ''} ${p.location || ''} ${p.category || ''} ${p.highlights || ''} ${p.tags || ''}`
}

function isEuropePackage(p) {
  return EUROPE_RE.test(haystackFromPackage(p))
}

function formatDuration(duration) {
  const m = String(duration).match(/(\d+)\s*D\s*\/\s*(\d+)\s*N/i)
  if (!m) return duration
  const days = Number(m[1])
  const nights = Number(m[2])
  const dLabel = days === 1 ? 'day' : 'days'
  const nLabel = nights === 1 ? 'night' : 'nights'
  return `${days} ${dLabel} • ${nights} ${nLabel}`
}

function mapPackageToCard(p) {
  const hay = haystackFromPackage(p).toLowerCase()
  let tags = ['all']
  if (REGION_TABS.find((r) => r.id === 'capitals')?.test(hay)) tags.push('capitals')
  if (REGION_TABS.find((r) => r.id === 'alps')?.test(hay)) tags.push('alps')
  if (REGION_TABS.find((r) => r.id === 'mediterranean')?.test(hay)) tags.push('mediterranean')
  if (REGION_TABS.find((r) => r.id === 'nordic')?.test(hay)) tags.push('nordic')
  if (tags.length === 1) tags.push('capitals')

  return {
    id: p.id,
    tags,
    badge: p.is_trending ? 'hot' : p.is_curated ? 'signature' : 'value',
    country: (p.location || 'Europe').split(',')[0].trim(),
    duration: p.duration || 'Custom',
    name: p.title || 'European journey',
    price: Number(p.price || 0),
    image:
      mediaUrl(p.image_path) ||
      mediaUrl(p.cover_image) ||
      FALLBACK_IMAGE,
    to: `/packages/${String(p.slug || p.title || p.id)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')}`,
  }
}

export function EuropeSpotlight({
  title = 'The Continental edit',
  subtitle = 'Europe-only journeys — capital nights, alpine calm, and coastlines curated for pace and polish.',
}) {
  const [region, setRegion] = useState('all')
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

  const cmsEurope = useMemo(() => {
    return (cmsItems || [])
      .filter((item) => {
        const blob = `${item.title || ''} ${item.subtitle || ''} ${item.tags || ''} ${item.link_url || ''}`
        return EUROPE_RE.test(blob)
      })
      .map((item) => {
        const hay = `${item.title || ''} ${item.subtitle || ''} ${item.tags || ''}`.toLowerCase()
        let tags = ['all']
        REGION_TABS.forEach((r) => {
          if (r.id !== 'all' && r.test(hay)) tags.push(r.id)
        })
        if (tags.length === 1) tags.push('capitals')
        return {
          id: `cms-${item.id}`,
          tags,
          badge: item.badge || 'signature',
          country: item.subtitle || 'Europe',
          duration: item.duration || 'Custom',
          name: item.title,
          price: Number(item.price || 0),
          image: mediaUrl(item.image_url) || FALLBACK_IMAGE,
          to: item.link_url || '/packages',
        }
      })
  }, [cmsItems])

  const packageEurope = useMemo(() => {
    return (packages || []).filter(isEuropePackage).map(mapPackageToCard)
  }, [packages])

  const pool = useMemo(() => {
    const merged = [...cmsEurope, ...packageEurope]
    const seen = new Set()
    const deduped = []
    for (const c of merged) {
      const key = `${c.name}|${c.country}`
      if (seen.has(key)) continue
      seen.add(key)
      deduped.push(c)
    }
    if (deduped.length > 0) return deduped
    return SHOWCASE_FALLBACK
  }, [cmsEurope, packageEurope])

  const filtered = useMemo(() => {
    const tab = REGION_TABS.find((r) => r.id === region)
    if (!tab || region === 'all') return pool
    return pool.filter((p) => p.tags.includes(region))
  }, [pool, region])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-europe-card]')
    const step = (card?.offsetWidth ?? 300) + GAP_PX
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollLeft = 0
  }, [region])

  useEffect(() => {
    if (!autoPlay) return undefined
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return undefined

    const id = window.setInterval(() => {
      if (Date.now() - lastUserActionRef.current < 2500) return
      scrollByDir(1)
    }, 3400)
    return () => window.clearInterval(id)
  }, [autoPlay, scrollByDir])

  const markUserAction = () => {
    lastUserActionRef.current = Date.now()
  }

  return (
    <section
      className="relative overflow-hidden bg-[#080c16] py-16 text-white lg:py-24"
      aria-labelledby="europe-spotlight-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 52px, rgba(212,175,55,0.12) 52px, rgba(212,175,55,0.12) 53px)`,
          }}
        />
        <div className="absolute -left-20 top-1/4 h-72 w-72 rounded-full bg-honey/15 blur-[100px]" />
        <div className="absolute -right-16 bottom-0 h-80 w-80 rounded-full bg-indigo-600/20 blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-honey/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-honey/35 bg-honey/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.28em] text-honey">
              <span className="h-1.5 w-1.5 rounded-full bg-honey shadow-[0_0_10px_rgba(250,204,21,0.9)]" aria-hidden />
              Europe exclusive
            </p>
            <h2
              id="europe-spotlight-heading"
              className="mt-4 font-sans text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12]"
            >
              <span className="text-white">{title}</span>
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-white/65 sm:text-lg">{subtitle}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 lg:justify-end">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Curated regions</span>
            <div
              className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-1.5 backdrop-blur-sm"
              role="tablist"
              aria-label="European regions"
            >
              {REGION_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={region === id}
                  onClick={() => setRegion(id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition sm:px-3.5 sm:text-sm ${
                    region === id
                      ? 'bg-gradient-to-br from-honey to-amber-500 text-neutral-900 shadow-lg shadow-amber-500/25'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 opacity-90 sm:h-4 sm:w-4" strokeWidth={2} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-white/20 bg-white/[0.03] py-14 text-center text-white/60">
            No Europe packages match this filter yet — try another region or browse all packages.
          </p>
        ) : (
          <div className="relative mt-10 md:mt-12">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0c1222]/95 text-white shadow-xl backdrop-blur-md transition hover:border-honey/50 hover:text-honey md:flex"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-[#0c1222]/95 text-white shadow-xl backdrop-blur-md transition hover:border-honey/50 hover:text-honey md:flex"
              aria-label="Next"
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
                      key={`${region}-${pkg.id}`}
                      data-europe-card
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 16 }}
                      transition={{ duration: 0.24 }}
                      className="relative h-[400px] w-[min(300px,calc(100vw-3rem))] shrink-0 snap-start sm:h-[420px] sm:w-[min(320px,calc(50vw-1.5rem))] md:h-[440px] lg:h-[460px] lg:w-[calc((100%-3*1rem)/4)] lg:max-w-none"
                    >
                      <Link
                        to={pkg.to}
                        className="group relative flex h-full w-full flex-col overflow-hidden rounded-[28px] bg-slate-950 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.85)] ring-1 ring-honey/20 transition-all duration-500 hover:ring-honey/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2 focus-visible:ring-offset-[#080c16]"
                        onFocus={() => {
                          setAutoPlay(false)
                          markUserAction()
                        }}
                        onBlur={() => {
                          setAutoPlay(true)
                          markUserAction()
                        }}
                      >
                        <div className="pointer-events-none absolute inset-0 z-[1] rounded-[28px] ring-1 ring-inset ring-white/10" />
                        <div className="pointer-events-none absolute -inset-8 z-0 bg-gradient-to-br from-honey/0 via-transparent to-indigo-500/0 opacity-0 blur-3xl transition-opacity duration-500 group-hover:from-honey/20 group-hover:to-indigo-500/20 group-hover:opacity-100" />
                        <img
                          src={pkg.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.06]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-[#0a0d14]/75 to-black/20" />

                        <div className="relative z-10 flex items-start justify-between p-3.5 sm:p-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide sm:text-xs ${meta.barClass}`}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                            {meta.label}
                          </span>
                          <span className="rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-honey/95 backdrop-blur-sm">
                            EU
                          </span>
                        </div>

                        <div className="relative z-10 mt-auto p-3.5 sm:p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur-sm sm:text-xs">
                              <MapPin className="h-3.5 w-3.5 text-honey" strokeWidth={2} />
                              {pkg.country}
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white/95 backdrop-blur-sm sm:text-xs">
                              <Clock className="h-3.5 w-3.5 text-honey/90" strokeWidth={2} />
                              {formatDuration(pkg.duration)}
                            </span>
                          </div>
                          <h3 className="mt-3 font-sans text-lg font-bold leading-snug text-white sm:text-xl">
                            {pkg.name}
                          </h3>
                          <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="text-xl font-bold text-white sm:text-2xl">
                              {pkg.price > 0 ? (
                                <>
                                  <span className="text-sm font-semibold text-white/60">from </span>$
                                  {pkg.price.toLocaleString()}
                                  <span className="text-sm font-medium text-white/55"> / person</span>
                                </>
                              ) : (
                                <span className="text-base font-semibold text-honey">Request quote</span>
                              )}
                            </p>
                            <span
                              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-honey shadow-inner backdrop-blur-sm transition-all duration-300 group-hover:border-honey/60 group-hover:bg-honey group-hover:text-neutral-900"
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollByDir(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row md:mt-14">
          <Link
            to="/packages"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-honey to-amber-500 px-9 py-3.5 text-sm font-bold text-neutral-900 shadow-lg shadow-amber-500/30 transition hover:brightness-105 sm:px-10 sm:text-base"
          >
            View all packages
          </Link>
          <p className="text-center text-xs text-white/45 sm:text-left">
            Showing Europe journeys only — pulled from your live catalogue when available.
          </p>
        </div>
      </div>
    </section>
  )
}
