import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Heart,
  Hotel,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Plane,
  Share2,
  Sparkles,
  Star,
  Sun,
  User,
  Waves,
  X,
} from 'lucide-react'
import { mediaUrl } from '../../api/adminPublic'
import {
  formatInr,
  hotelsForTier,
  normalizeSlug,
  rowBelongsToPackage,
  parseCancellationRules,
  parseDayActivities,
  parseDurationParts,
  parseFaqBlocks,
  parseNotes,
  parseTermsBlocks,
  splitListField,
  tierPriceForStar,
  whatsappHrefFromSettings,
} from './luxuryHelpers'
import { BayardItinerarySection } from './BayardItinerarySection'
import { PackageEnquirySidebar } from './PackageEnquirySidebar'
import { PackageDetailBelowFold } from './PackageDetailBelowFold'
import { WhyChooseHoneybeeTripsSection } from './WhyChooseHoneybeeTripsSection'

/** Clean sans-serif for prices, durations, and stats (no display/serif numerals). */
const NUM = 'font-sans tabular-nums tracking-tight'

/** Main content: white card on soft gray (minimal / premium). */
const CARD =
  'rounded-2xl border border-neutral-200/90 bg-white shadow-soft'
/** Hero price — frosted glass on photo (Bayard-style). */
const HERO_GLASS_CARD =
  'rounded-2xl border border-white/20 bg-black/30 shadow-[0_12px_48px_rgba(0,0,0,0.45)] backdrop-blur-2xl'
const HERO_GLASS_TILE =
  'rounded-xl border border-white/10 bg-black/35 px-4 py-3.5 backdrop-blur-md'

/** Hero price — light glass (original style used by the sidebar/price card). */
const HERO_PRICE_CARD =
  'rounded-2xl border-2 border-lux-gold/50 bg-white/90 shadow-[0_0_48px_-8px_rgba(244,196,0,0.55),0_16px_40px_-12px_rgba(0,0,0,0.08)] backdrop-blur-xl ring-1 ring-lux-gold/20'

const HERO_SOCIAL_AVATARS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80',
]
const HIGHLIGHT_ICONS = [Sun, Waves, MapPin, Sparkles, Camera, Compass]

function ActivityIcon({ label }) {
  const t = String(label || '').toLowerCase()
  if (t.includes('flight') || t.includes('airport') || t.includes('arrival'))
    return <Plane className="h-4 w-4 shrink-0 text-lux-gold" strokeWidth={1.5} />
  if (t.includes('temple') || t.includes('culture'))
    return <Sparkles className="h-4 w-4 shrink-0 text-lux-gold" strokeWidth={1.5} />
  if (t.includes('beach') || t.includes('water') || t.includes('sport'))
    return <Waves className="h-4 w-4 shrink-0 text-lux-gold" strokeWidth={1.5} />
  if (t.includes('hotel') || t.includes('check'))
    return <Hotel className="h-4 w-4 shrink-0 text-lux-gold" strokeWidth={1.5} />
  return <Sparkles className="h-4 w-4 shrink-0 text-lux-gold" strokeWidth={1.5} />
}

function NavPill({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] transition ${
        active
          ? 'bg-lux-gold text-lux-black shadow-md shadow-lux-gold/40 ring-1 ring-lux-gold/60'
          : 'border border-transparent bg-neutral-100/90 text-neutral-700 hover:bg-amber-50/90 hover:text-lux-black'
      }`}
    >
      {children}
    </button>
  )
}

function StarRow({ count }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(count) || 0)))
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-lux-gold text-lux-gold" aria-hidden />
      ))}
    </span>
  )
}

/**
 * @param {{
 *   pkg: Record<string, unknown>
 *   itinerary: any[]
 *   hotels: any[]
 *   relatedPackages: any[]
 *   galleryPaths: string[]
 *   reviews: any[]
 *   settings: Record<string, string> | null
 *   openBooking: (defaults?: Record<string, string>) => void
 * }} props
 */
export function LuxuryPackageDetailView({
  pkg,
  itinerary,
  hotels,
  relatedPackages,
  galleryPaths,
  reviews,
  settings,
  openBooking,
}) {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '18%'])
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08])

  const [tier, setTier] = useState(3)
  const [activeSection, setActiveSection] = useState('overview')
  const [expandedDays, setExpandedDays] = useState(() => new Set())
  const [notesExpanded, setNotesExpanded] = useState(false)
  const [storyIndex, setStoryIndex] = useState(0)
  const [heroIdx, setHeroIdx] = useState(0)

  const slug = normalizeSlug(pkg.slug || pkg.title || pkg.id)
  const isBayardRomanticEscape = slug === 'bali-romantic-escape'

  const gallery = useMemo(() => {
    const paths = (galleryPaths || []).map((p) => mediaUrl(p)).filter(Boolean)
    const cover = mediaUrl(pkg.image_path) || mediaUrl(pkg.cover_image)
    if (paths.length) return paths
    if (cover) return [cover]
    return ['https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=2000&q=85']
  }, [galleryPaths, pkg.image_path, pkg.cover_image])

  const highlights = useMemo(() => splitListField(pkg.highlights), [pkg.highlights])
  const inclusions = useMemo(() => splitListField(pkg.inclusions), [pkg.inclusions])
  const exclusions = useMemo(() => splitListField(pkg.exclusions), [pkg.exclusions])
  const notes = useMemo(() => parseNotes(pkg.important_notes), [pkg.important_notes])
  const cancellationRules = useMemo(
    () => parseCancellationRules(pkg.cancellation_policy),
    [pkg.cancellation_policy]
  )
  const termsBlocks = useMemo(() => parseTermsBlocks(pkg.terms), [pkg.terms])
  const faqBlocks = useMemo(() => parseFaqBlocks(pkg.faq), [pkg.faq])

  const sortedItinerary = useMemo(() => {
    const pid = Number(pkg?.id)
    let rows = Array.isArray(itinerary) ? [...itinerary] : []
    if (Number.isFinite(pid) && pid > 0) {
      rows = rows.filter((r) => rowBelongsToPackage(r, pid))
    }
    const seen = new Set()
    rows = rows.filter((r) => {
      const rid = Number(r?.id)
      if (!Number.isFinite(rid) || rid <= 0) return true
      if (seen.has(rid)) return false
      seen.add(rid)
      return true
    })
    rows.sort((a, b) => {
      const sa = Number(a.sort_order ?? 0)
      const sb = Number(b.sort_order ?? 0)
      if (sa !== sb) return sa - sb
      const da = Number(a.day_number ?? 0)
      const db = Number(b.day_number ?? 0)
      if (da !== db) return da - db
      return Number(a.id ?? 0) - Number(b.id ?? 0)
    })
    return rows
  }, [itinerary, pkg.id])

  const tierHotels = useMemo(() => {
    const pid = Number(pkg?.id)
    const list = Array.isArray(hotels) ? hotels : []
    const scoped =
      Number.isFinite(pid) && pid > 0 ? list.filter((h) => rowBelongsToPackage(h, pid)) : list
    return hotelsForTier(scoped, tier)
  }, [hotels, tier, pkg.id])

  const price = useMemo(() => tierPriceForStar(pkg, tier), [pkg, tier])

  const covered =
    String(pkg.covered_destinations || '').trim() ||
    String(pkg.location || '').trim() ||
    '—'
  const bestTime = String(pkg.best_time_visit || '').trim() || '—'
  const idealFor = String(pkg.ideal_for || '').trim() || '—'
  const overviewHtml = String(pkg.full_desc || pkg.short_desc || '').trim()

  const reviewAvg = useMemo(() => {
    const nums = (reviews || []).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n) && n > 0)
    if (!nums.length) return null
    return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
  }, [reviews])

  const displayRating = reviewAvg || '4.8'
  const locationLabel = useMemo(() => {
    const first = String(pkg.location || '')
      .split(',')[0]
      .trim()
    return first ? first.toUpperCase() : 'DESTINATION'
  }, [pkg.location])
  const durationParts = useMemo(() => parseDurationParts(pkg.duration), [pkg.duration])
  const destinationCrumb = useMemo(() => {
    const fromLoc = String(pkg.location || '')
      .split(',')[0]
      .trim()
    if (fromLoc) return normalizeSlug(fromLoc)
    return slug.split('-')[0] || slug
  }, [pkg.location, slug])

  const waHref = whatsappHrefFromSettings(settings, `Hi HoneyBee Trips — I'm interested in "${pkg.title}".`)

  const scrollTo = useCallback((id, tab) => {
    setActiveSection(tab)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const toggleDay = useCallback((dayId) => {
    setExpandedDays((prev) => {
      const next = new Set(prev)
      if (next.has(dayId)) next.delete(dayId)
      else next.add(dayId)
      return next
    })
  }, [])

  const expandAllDays = useCallback(() => {
    const all = new Set(sortedItinerary.map((r) => r.id))
    setExpandedDays((prev) => (prev.size === all.size ? new Set() : all))
  }, [sortedItinerary])

  const allItineraryDaysExpanded =
    sortedItinerary.length > 0 && expandedDays.size === sortedItinerary.length

  /** Open all day panels by default so CMS itinerary is visible without extra clicks. */
  useEffect(() => {
    if (!sortedItinerary.length || sortedItinerary.length > 14) return
    setExpandedDays(new Set(sortedItinerary.map((r) => r.id)))
  }, [sortedItinerary])

  const storyReviews = useMemo(() => (Array.isArray(reviews) ? reviews.slice(0, 12) : []), [reviews])

  useEffect(() => {
    setStoryIndex((i) => {
      if (!storyReviews.length) return 0
      return Math.min(i, storyReviews.length - 1)
    })
  }, [storyReviews.length])
  const relatedSlice = useMemo(
    () => (Array.isArray(relatedPackages) ? relatedPackages.slice(0, 8) : []),
    [relatedPackages]
  )

  const reelPoster =
    gallery[Math.min(1, gallery.length - 1)] || gallery[0]

  const navTabs = [
    ['overview', 'Overview'],
    ['itinerary', 'Itinerary'],
    ['stay', 'Stay'],
    ['inclusions', 'Inclusions'],
    ['faq', 'FAQ'],
    ['policies', 'T&C'],
    ['cancellation', 'Cancellation'],
  ]

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[#f5f5f4] font-sans text-neutral-800 antialiased">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,#ffffff_0%,#f5f5f4_38%,#f0f0ed_100%)]"
        aria-hidden
      />
      <div className="relative z-[1]">
      {/* Hero — cinematic image, copy stays light on photo */}
      <section
        ref={heroRef}
        className="relative -mt-20 min-h-[100svh] overflow-hidden pt-20 text-white sm:-mt-24 sm:pt-24"
      >
        <motion.div
          style={{ y: bgY, scale: bgScale }}
          className="absolute inset-0 will-change-transform"
        >
          <img
            src={gallery[heroIdx % gallery.length]}
            alt=""
            className="h-[120%] w-full object-cover"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f5f5f4] via-neutral-900/25 to-amber-400/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/25" />

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl flex-col justify-end gap-10 px-4 pb-16 pt-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:pb-20 lg:pt-8">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-lux-gold/40 bg-lux-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-lux-gold">
                <MapPin className="h-3.5 w-3.5" />
                {isBayardRomanticEscape ? String(pkg.location || 'Destination').toUpperCase() : locationLabel}
              </span>
              {isBayardRomanticEscape ? (
                <span className="inline-flex items-center gap-3">
                  <span className="flex -space-x-2.5">
                    {HERO_SOCIAL_AVATARS.slice(0, 4).map((src, i) => (
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="h-9 w-9 rounded-full border-2 border-black/60 object-cover ring-1 ring-white/20"
                        style={{ zIndex: 10 - i }}
                        loading="lazy"
                      />
                    ))}
                  </span>
                  <span className="rounded-full bg-sky-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-md">
                    +2k
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/35 px-3 py-1.5 text-xs text-white/90 backdrop-blur-md">
                    <Star className="h-3.5 w-3.5 fill-lux-gold text-lux-gold" aria-hidden />
                    <span className={`font-semibold ${NUM}`}>{displayRating}</span>
                    <span className="text-white/70">/ 5 Rating</span>
                  </span>
                </span>
              ) : (
                reviewAvg && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/30 px-3 py-1 text-[11px] text-white/90">
                    <Star className="h-3.5 w-3.5 fill-lux-gold text-lux-gold" />
                    <span className={NUM}>{reviewAvg}</span> / 5
                  </span>
                )
              )}
            </div>
            <h1 className="mt-5 max-w-3xl font-sans text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
              {pkg.title}
            </h1>
            <p className="mt-3 max-w-xl text-sm font-normal leading-relaxed text-white/85 sm:text-base">
              {String(pkg.short_desc || '').slice(0, 220)}
              {String(pkg.short_desc || '').length > 220 ? '…' : ''}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80">
                {isBayardRomanticEscape ? String(pkg.category || 'Package').toUpperCase() : String(pkg.category || 'Package')}
              </span>
              <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.16em] text-white/80">
                {isBayardRomanticEscape ? `IDEAL FOR: ${idealFor}` : `Ideal for: ${idealFor}`}
              </span>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  openBooking({
                    destination: `${pkg.title} (${tier}★ tier)`,
                    budget: `${formatInr(price)} per person (CMS)`,
                  })
                }
                className="rounded-full bg-lux-gold px-6 py-3 text-sm font-bold uppercase tracking-wide text-lux-black shadow-lg shadow-lux-gold/30 transition hover:brightness-110"
              >
                Enquire now
              </button>
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-lux-gold/50 hover:bg-white/15"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
              <button
                type="button"
                onClick={() =>
                  openBooking({
                    destination: `Customize: ${pkg.title}`,
                    budget: 'Custom itinerary quote',
                  })
                }
                className="rounded-full border border-lux-gold/50 bg-transparent px-6 py-3 text-sm font-semibold text-lux-gold transition hover:bg-lux-gold/10"
              >
                Customize trip
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={false}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`w-full max-w-md ${HERO_PRICE_CARD} p-6 lg:mb-2`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-lux-gold">Starting from</p>
            <div className="mt-2 flex items-end gap-3">
              <p className={`text-4xl font-semibold text-neutral-900 sm:text-5xl ${NUM}`}>{formatInr(price)}</p>
              <span
                className={`mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-lux-gold text-lg font-semibold text-lux-black shadow-lg shadow-lux-gold/50 ${NUM}`}
              >
                ₹
              </span>
            </div>
            <p className="mt-1 text-xs text-neutral-500">Per person · tier {tier}★ · taxes as per policy</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-lux-gold/25 bg-amber-50/80 px-4 py-3">
                <Clock className="h-4 w-4 text-lux-gold" />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600">Duration</p>
                <p className={`text-sm font-semibold text-neutral-900 ${NUM}`}>{pkg.duration || '—'}</p>
              </div>
              <div className="rounded-xl border border-lux-gold/25 bg-amber-50/80 px-4 py-3">
                <Calendar className="h-4 w-4 text-lux-gold" />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600">Category</p>
                <p className="text-sm font-semibold text-neutral-900">{pkg.category || '—'}</p>
              </div>
            </div>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {gallery.slice(0, isBayardRomanticEscape ? 5 : 6).map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  onClick={() => {
                    setHeroIdx(i)
                  }}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                    heroIdx === i ? 'border-lux-gold shadow-[0_0_20px_2px_rgba(244,196,0,0.55)]' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-6 text-[11px] text-white/55 sm:px-6">
          <Link to="/" className="text-white/80 hover:text-lux-gold">
            Home
          </Link>
          {' '}
          /{' '}
          <Link to="/packages" className="text-white/80 hover:text-lux-gold">
            Packages
          </Link>
          {' '}
          /{' '}
          <span className="text-white/90">{slug}</span>
        </div>
      </section>

      <div className="bg-[#f5f5f4] text-neutral-800 antialiased">

      {/* Sticky section nav */}
      <div className="sticky top-16 z-40 border-b border-neutral-200/90 bg-white/90 shadow-sm backdrop-blur-xl sm:top-20">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6">
          {navTabs.map(([id, label]) => (
            <NavPill
              key={id}
              active={activeSection === id}
              onClick={() => scrollTo(`lux-${id}`, id)}
            >
              {label}
            </NavPill>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-24 bg-gradient-to-b from-lux-gold/[0.06] to-transparent" aria-hidden />
        <div className={`relative z-[1] grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12${isBayardRomanticEscape ? ' lg:items-start' : ''}`}>
          {/* Main column */}
          <div className="min-w-0 space-y-20">
            <motion.section
              id="lux-overview"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5 }}
            >
              <div className={`${CARD} p-6 sm:p-8`}>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-lux-gold">Package overview</p>
                <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                  Essential <span className="text-lux-gold">details</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Curated from your CMS — update anytime in admin.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { icon: Clock, label: 'Duration', value: pkg.duration || '—' },
                    { icon: MapPin, label: 'Destinations covered', value: covered },
                    { icon: Sun, label: 'Best time to visit', value: bestTime },
                    { icon: Heart, label: 'Perfect for', value: idealFor },
                  ].map(({ icon: Icon, label, value }) => (
                    <div
                      key={label}
                      className="flex gap-4 rounded-xl border border-neutral-100 bg-[#fafafa] p-4"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lux-gold/15 text-lux-gold">
                        <Icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-600">{label}</p>
                        <p className="mt-1 text-sm font-medium text-neutral-900">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {overviewHtml && (
                  <div className="mt-8 border-t border-stone-200 pt-8">
                    {overviewHtml.includes('<') ? (
                      <div
                        className="prose prose-sm prose-neutral max-w-none text-neutral-700"
                        dangerouslySetInnerHTML={{ __html: overviewHtml }}
                      />
                    ) : (
                      <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">{overviewHtml}</p>
                    )}
                  </div>
                )}
              </div>
            </motion.section>

            {highlights.length > 0 && (
              <motion.section
                id="lux-highlights"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Major <span className="text-lux-gold">highlights</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Key experiences from your highlights field.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {highlights.map((h, i) => {
                    const Icon = HIGHLIGHT_ICONS[i % HIGHLIGHT_ICONS.length]
                    return (
                      <div
                        key={h}
                        className="group flex gap-4 rounded-xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:border-lux-gold/40"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-lux-gold/15 text-lux-gold transition group-hover:bg-lux-gold/25">
                          <Icon className="h-5 w-5" strokeWidth={1.5} />
                        </div>
                        <p className="text-sm font-medium leading-snug text-neutral-800">{h}</p>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {isBayardRomanticEscape ? (
              <BayardItinerarySection
                rows={sortedItinerary}
                expandedDays={expandedDays}
                onToggleDay={toggleDay}
                onExpandAll={expandAllDays}
                allExpanded={allItineraryDaysExpanded}
              />
            ) : (
            <motion.section
              id="lux-itinerary"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Your daily <span className="text-lux-gold">itinerary</span>
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">Day-wise plan from itineraries in admin.</p>
                </div>
                {sortedItinerary.length > 0 && (
                  <button
                    type="button"
                    onClick={expandAllDays}
                    className="text-xs font-bold uppercase tracking-wider text-lux-gold hover:underline"
                  >
                    Expand / collapse all
                  </button>
                )}
              </div>
              <div className="relative mt-10 space-y-0">
                <div className="absolute left-[1.15rem] top-3 bottom-3 w-px bg-gradient-to-b from-lux-gold/60 via-stone-300 to-stone-200 sm:left-6" />
                {sortedItinerary.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 py-10 text-center text-sm text-neutral-600">
                    No itinerary rows yet. Add days in Admin → Itineraries.
                    {import.meta.env.DEV ? (
                      <span className="mt-3 block max-w-lg mx-auto text-[11px] leading-relaxed text-amber-900/85">
                        If days already exist in local admin but this stays empty: the frontend is probably calling a{' '}
                        <strong>different</strong> API/database than <code className="rounded bg-amber-100/80 px-1 font-mono text-[10px]">php -S</code>. Remove{' '}
                        <code className="rounded bg-amber-100/80 px-1 font-mono text-[10px]">VITE_ADMIN_PUBLIC_BASE</code> from{' '}
                        <code className="rounded bg-amber-100/80 px-1 font-mono text-[10px]">frontend/.env</code> so Vite proxies{' '}
                        <code className="rounded bg-amber-100/80 px-1 font-mono text-[10px]">/admin-api</code> to your admin. See{' '}
                        <code className="rounded bg-amber-100/80 px-1 font-mono text-[10px]">.env.example</code>.
                      </span>
                    ) : null}
                  </p>
                ) : (
                  sortedItinerary.map((row, idx) => {
                    const open = expandedDays.has(row.id)
                    const parsed = parseDayActivities(row.description)
                    const imgs = Array.isArray(row.image_paths) ? row.image_paths.map((p) => mediaUrl(p)).filter(Boolean) : []
                    const dn = Number(row.day_number)
                    const displayDay = Number.isFinite(dn) && dn > 0 ? dn : idx + 1
                    const dayLabel = displayDay >= 100 ? String(displayDay) : String(displayDay).padStart(2, '0')
                    return (
                      <div key={row.id} className="relative pl-12 sm:pl-16">
                        <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-lux-gold text-[10px] font-bold uppercase leading-tight text-lux-black shadow-lg shadow-lux-gold/50 sm:h-12 sm:w-12 sm:text-[11px]">
                          Day
                          <br />
                          {dayLabel}
                        </div>
                        <motion.div
                          layout
                          className="mb-4 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm"
                        >
                          <button
                            type="button"
                            onClick={() => toggleDay(row.id)}
                            className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
                          >
                            <span className="font-display text-lg font-semibold text-neutral-900">{row.title}</span>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-lux-gold transition ${open ? 'rotate-180' : ''}`}
                            />
                          </button>
                          <AnimatePresence initial={false}>
                            {open && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                className="border-t border-stone-200"
                              >
                                <div className="space-y-3 px-5 py-4 sm:px-6">
                                  {parsed.kind === 'html' ? (
                                    <div
                                      className="prose prose-sm prose-neutral max-w-none text-neutral-700"
                                      dangerouslySetInnerHTML={{ __html: parsed.html }}
                                    />
                                  ) : (
                                    <ul className="space-y-2">
                                      {parsed.items.map((line) => (
                                        <li key={line} className="flex gap-3 text-sm text-neutral-700">
                                          <ActivityIcon label={line} />
                                          <span>{line}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {imgs.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pt-2">
                                      {imgs.map((src) => (
                                        <img
                                          key={src}
                                          src={src}
                                          alt=""
                                          className="h-24 w-36 shrink-0 rounded-xl object-cover ring-1 ring-stone-200/80"
                                        />
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.section>
            )}

            <motion.section
              id="lux-stay"
              initial={false}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                    Where you&apos;ll <span className="text-lux-gold">stay</span>
                  </h2>
                  <p className="mt-2 text-sm text-neutral-500">Hotels from admin, filtered by star tier tab.</p>
                </div>
                <div className="flex gap-2 rounded-full border border-neutral-200 bg-white p-1 shadow-sm">
                  {[3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTier(s)}
                      className={`rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition ${
                        tier === s
                          ? 'bg-lux-gold text-lux-black shadow-md shadow-lux-gold/45'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {s}★
                    </button>
                  ))}
                </div>
              </div>
              {tierHotels.length === 0 ? (
                <p className="mt-8 rounded-2xl border border-dashed border-stone-200 py-10 text-center text-sm text-neutral-600">
                  No {tier}★ hotels linked for this package. Add them under Admin → Hotels.
                </p>
              ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2">
                  {tierHotels.map((h) => {
                    const imgs = Array.isArray(h.image_paths) ? h.image_paths.map((p) => mediaUrl(p)).filter(Boolean) : []
                    const cover = imgs[0] || mediaUrl(h.image_path) || gallery[0]
                    const amenityList = String(h.amenities || '')
                      .split(/[\n,]/)
                      .map((x) => x.trim())
                      .filter(Boolean)
                    const rating = Number(h.star_rating)
                    const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${h.name} ${h.location || ''}`)}`
                    return (
                      <div
                        key={h.id}
                        className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft"
                      >
                        <div className="relative aspect-[16/10]">
                          <img src={cover} alt="" className="h-full w-full object-cover" />
                          <span className="absolute left-3 top-3 rounded-full bg-lux-gold px-2 py-1 text-[10px] font-bold uppercase text-lux-black">
                            Handpicked
                          </span>
                          <span className="absolute right-3 top-3 rounded-full bg-lux-gold/95 px-2 py-1 text-[10px] font-bold text-lux-black shadow-sm shadow-lux-gold/40">
                            {tier}★
                          </span>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-xl font-semibold text-neutral-900">{h.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-neutral-500">
                            <MapPin className="h-3.5 w-3.5 text-lux-gold" />
                            {h.location || '—'}
                          </p>
                          {h.description ? (
                            <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{h.description}</p>
                          ) : null}
                          {h.notes ? (
                            <p className="mt-1 text-xs uppercase tracking-wide text-lux-gold/90">{h.notes}</p>
                          ) : null}
                          {Number.isFinite(rating) && rating > 0 && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-600">
                              <StarRow count={rating} />
                              <span>{rating}</span>
                            </div>
                          )}
                          {amenityList.length > 0 && (
                            <ul className="mt-3 flex flex-wrap gap-1.5">
                              {amenityList.slice(0, 6).map((a) => (
                                <li
                                  key={a}
                                  className="rounded-full border border-stone-200 bg-stone-100 px-2 py-0.5 text-[11px] text-neutral-600"
                                >
                                  {a}
                                </li>
                              ))}
                            </ul>
                          )}
                          <a
                            href={mapsHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-lux-gold/40 py-2.5 text-xs font-bold uppercase tracking-wider text-lux-gold transition hover:bg-lux-gold/10"
                          >
                            <MapPin className="h-4 w-4" />
                            Google Maps
                          </a>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.section>

            <WhyChooseHoneybeeTripsSection className="mt-12" />

            <div className="grid gap-8 lg:grid-cols-2" id="lux-inclusions">
              {inclusions.length > 0 && (
                <motion.section
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${CARD} overflow-hidden p-0 shadow-soft`}
                >
                  <div className="flex items-center justify-between border-b border-lux-gold/30 bg-gradient-to-r from-lux-gold via-amber-300 to-lux-gold px-6 py-4 shadow-[0_8px_24px_-6px_rgba(244,196,0,0.35)]">
                    <div className="flex items-center gap-2 text-lux-black">
                      <Check className="h-5 w-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">Included</span>
                    </div>
                    <span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-lux-black ring-1 ring-lux-gold/35 shadow-sm shadow-lux-gold/25">
                      {inclusions.length} items
                    </span>
                  </div>
                  <ul className="space-y-3 p-6">
                    {inclusions.map((line) => (
                      <li key={line} className="flex gap-3 rounded-lg border border-neutral-100 bg-[#fafafa] px-3 py-2.5 text-sm text-neutral-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-lux-gold/20 text-lux-gold">
                          <Check className="h-3 w-3" />
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </motion.section>
              )}
              {exclusions.length > 0 && (
                <motion.section
                  initial={false}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`${CARD} overflow-hidden p-0 shadow-soft`}
                >
                  <div className="flex items-center justify-between border-b border-lux-gold/25 bg-amber-100/90 px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-800">
                      <X className="h-5 w-5 text-amber-700" />
                      <span className="text-xs font-bold uppercase tracking-wider">Not included</span>
                    </div>
                  </div>
                  <ul className="space-y-3 p-6">
                    {exclusions.map((line) => (
                      <li key={line} className="flex gap-3 rounded-lg border border-neutral-100 bg-[#fafafa] px-3 py-2.5 text-sm text-neutral-700">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-600">
                          <X className="h-3 w-3" />
                        </span>
                        {line}
                      </li>
                    ))}
                  </ul>
                </motion.section>
              )}
            </div>

            {notes.length > 0 && (
              <motion.section
                id="lux-notes"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`${CARD} p-6 sm:p-8`}
              >
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Important <span className="text-lux-gold">notes</span>
                </h2>
                <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                  {(notesExpanded ? notes : notes.slice(0, 4)).map((n) => (
                    <li
                      key={n}
                      className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-neutral-700"
                    >
                      {n}
                    </li>
                  ))}
                </ul>
                {notes.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setNotesExpanded((v) => !v)}
                    className="mt-4 text-xs font-bold uppercase tracking-wider text-lux-gold hover:underline"
                  >
                    {notesExpanded ? 'Show fewer' : `Show all (${notes.length})`}
                  </button>
                )}
              </motion.section>
            )}

            {termsBlocks.length > 0 && (
              <motion.section
                id="lux-policies"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Terms &amp; <span className="text-lux-gold">conditions</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Structured from your CMS terms field (paragraph blocks).</p>
                <div className="mt-8 space-y-4">
                  {termsBlocks.map((block, i) => (
                    <div
                      key={`${block.title}-${i}`}
                      className="rounded-xl border border-neutral-100 bg-[#fafafa] p-5 backdrop-blur-md"
                    >
                      <h3 className="font-display text-lg font-semibold text-lux-gold">{block.title}</h3>
                      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-neutral-600">{block.body}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {cancellationRules.length > 0 && (
              <motion.section
                id="lux-cancellation"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  Cancellation <span className="text-lux-gold">policy</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Rules from the package cancellation field in admin.</p>
                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {cancellationRules.map((rule) => (
                    <div
                      key={rule}
                      className="rounded-xl border border-lux-gold/25 bg-white p-5 shadow-sm"
                    >
                      <p className="text-sm font-medium text-neutral-900">{rule}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

            {!isBayardRomanticEscape && (
              <>
            {relatedSlice.length > 0 && (
              <motion.section
                id="lux-related"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
                  More <span className="text-lux-gold">adventures</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-500">Related packages from your CMS.</p>
                <div className="mt-8 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {relatedSlice.map((p) => {
                    const pSlug = normalizeSlug(p.slug || p.title || p.id)
                    const img = mediaUrl(p.image_path) || gallery[0]
                    const trending = Number(p.is_trending) === 1 || Number(p.is_featured) === 1
                    return (
                      <Link
                        key={p.id}
                        to={`/packages/${pSlug}`}
                        className="group relative w-[min(100%,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition hover:border-lux-gold/50"
                      >
                        <div className="relative aspect-[4/3]">
                          <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                          {trending && (
                            <span className="absolute left-3 top-3 rounded-full bg-lux-gold px-2 py-0.5 text-[10px] font-bold uppercase text-lux-black">
                              Trending
                            </span>
                          )}
                          <span className="absolute bottom-3 right-3 rounded-full bg-lux-gold/95 px-2 py-1 text-[10px] font-bold text-lux-black shadow-sm shadow-lux-gold/35">
                            {p.duration || '—'}
                          </span>
                        </div>
                        <div className="p-4">
                          <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-lux-gold">{p.title}</h3>
                          <p className={`mt-2 text-lg font-semibold text-lux-gold ${NUM}`}>{formatInr(p.price)}</p>
                          <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                            View
                            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </motion.section>
            )}

            {storyReviews.length > 0 && (
              <motion.section
                id="lux-stories"
                initial={false}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-[2rem] border-2 border-lux-gold/35 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/70 p-6 shadow-[0_0_48px_-12px_rgba(244,196,0,0.3)] sm:p-10"
              >
                <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
                  Guest <span className="text-lux-gold">stories</span>
                </h2>
                <p className="mt-2 text-sm text-neutral-600">Reviews from travelers who booked with HoneyBee Trips.</p>
                <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <div className="relative mx-auto w-full max-w-[260px]">
                    <div className="aspect-[9/16] overflow-hidden rounded-[2rem] border-2 border-lux-gold/40 bg-neutral-100 shadow-[0_0_32px_-4px_rgba(244,196,0,0.35)]">
                      <img src={reelPoster} alt="" className="h-full w-full object-cover opacity-90" />
                      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/45 via-neutral-900/15 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex justify-end gap-2">
                        <span className="rounded-full border border-lux-gold/40 bg-white/90 px-3 py-1 text-[10px] font-semibold text-neutral-800 shadow-[0_0_12px_2px_rgba(244,196,0,0.35)]">
                          Moments
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="relative min-h-[280px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={storyReviews[storyIndex]?.id || storyIndex}
                        initial={false}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.35 }}
                        className="rounded-2xl border border-lux-gold/25 bg-white p-6 text-neutral-800 shadow-soft shadow-[0_0_28px_-6px_rgba(244,196,0,0.28)]"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-lg font-semibold text-neutral-900">
                              {storyReviews[storyIndex]?.name || 'Traveler'}
                            </p>
                            <p className="text-xs text-neutral-400">{storyReviews[storyIndex]?.route || 'HoneyBee guest'}</p>
                          </div>
                          <StarRow count={storyReviews[storyIndex]?.rating} />
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                          &ldquo;{storyReviews[storyIndex]?.text}&rdquo;
                        </p>
                      </motion.div>
                    </AnimatePresence>
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        type="button"
                        aria-label="Previous review"
                        onClick={() =>
                          setStoryIndex((i) => (i - 1 + storyReviews.length) % storyReviews.length)
                        }
                        className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 shadow-sm hover:border-lux-gold/50 hover:shadow-[0_0_16px_-2px_rgba(244,196,0,0.45)]"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next review"
                        onClick={() => setStoryIndex((i) => (i + 1) % storyReviews.length)}
                        className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 shadow-sm hover:border-lux-gold/50 hover:shadow-[0_0_16px_-2px_rgba(244,196,0,0.45)]"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}


            {faqBlocks.length > 0 && (
              <motion.section id="lux-faq" initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-display text-3xl font-semibold tracking-tight">
                  Frequently asked <span className="text-lux-gold">questions</span>
                </h2>
                <div className="mt-6 space-y-3">
                  {faqBlocks.map((f) => (
                    <div key={f.q} className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                      <p className="font-semibold text-lux-gold">{f.q}</p>
                      <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}

              </>
            )}
          </div>

          <PackageEnquirySidebar
            tier={tier}
            setTier={setTier}
            price={price}
            pkgTitle={String(pkg.title)}
            openBooking={openBooking}
          />
        </div>

        {isBayardRomanticEscape && (
          <motion.div id="lux-more-advantages" className="mt-20 space-y-20 scroll-mt-28">
            <PackageDetailBelowFold
              relatedSlice={relatedSlice}
              gallery={gallery}
              storyReviews={storyReviews}
              storyIndex={storyIndex}
              setStoryIndex={setStoryIndex}
              reelPoster={reelPoster}
              faqBlocks={faqBlocks}
              horizontalScroll
            />
          </motion.div>
        )}
      </div>
      </div>
      </div>
    </div>
  )
}
