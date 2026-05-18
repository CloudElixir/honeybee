import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BookOpen,
  Clock,
  Heart,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { fetchPublic, mediaUrl } from '../api/adminPublic'
import { useSeo } from '../hooks/useSeo'
import { useBooking } from '../context/BookingContext'

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function formatInr(n) {
  return new Intl.NumberFormat('en-IN').format(Number(n) || 0)
}

const HERO_LOVE_IMG_1 =
  'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=82'
const HERO_LOVE_IMG_2 =
  'https://images.unsplash.com/photo-1522673606160-bbf57e42ee6d?auto=format&fit=crop&w=2000&q=82'
const HERO_LOVE_IMG_3 =
  'https://images.unsplash.com/photo-1519225421980-715cb0215468?auto=format&fit=crop&w=2000&q=82'

/** Falling petals only (no roses) — full viewport overlay */
function FallingPetals() {
  const items = useMemo(
    () =>
      Array.from({ length: 52 }, (_, i) => ({
        id: i,
        left: `${(i * 13 + (i % 9) * 2) % 98}%`,
        delay: (i * 0.18) % 6.5,
        duration: 8.5 + (i % 8) * 1.1,
        drift: ((i % 5) - 2) * 14,
        size: 7 + (i % 7),
        rot: (i % 5) * 18 - 36,
      })),
    []
  )

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[12] overflow-hidden"
      aria-hidden
    >
      {items.map((p) => (
        <motion.div
          key={p.id}
          className="absolute -top-6 rounded-full bg-gradient-to-br from-pink-200/90 via-rose-300/75 to-rose-400/55 shadow-sm"
          style={{
            width: p.size * 1.6,
            height: p.size * 0.9,
            left: p.left,
            borderRadius: '60% 40% 70% 30% / 40% 50% 50% 60%',
          }}
          initial={{ y: -20, opacity: 0, rotate: p.rot }}
          animate={{
            y: ['0vh', '108vh'],
            x: [0, p.drift * 0.85],
            opacity: [0, 0.88, 0.72, 0.35, 0],
            rotate: [p.rot, p.rot + 28],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}

/** Flat vector woman — teal dress, red bag & heels, floating hearts (reference style) */
function WomanIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 140 220" className={className} aria-hidden>
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M22 52 L18 58 L26 64 L32 56 Z"
          fill="#f43f5e"
          opacity={0.9}
        />
        <path
          d="M108 38 L104 46 L112 52 L118 44 Z"
          fill="#f43f5e"
          opacity={0.85}
        />
        <path
          d="M12 72 Q14 68 18 70 Q16 74 12 76 Z"
          fill="#fb7185"
        />
        <circle cx="70" cy="42" r="24" fill="#fdba74" />
        <path
          d="M42 38 Q70 12 98 38 Q102 52 94 58 L46 58 Q38 52 42 38Z"
          fill="#171717"
        />
        <ellipse cx="70" cy="44" rx="3" ry="2" fill="#171717" />
        <path d="M62 52 Q70 56 78 52" fill="none" stroke="#171717" strokeWidth="1.5" strokeLinecap="round" />
        <path
          d="M70 66 L44 198 L58 204 L70 130 L82 204 L96 198 L70 66Z"
          fill="#0f7663"
        />
        <path
          d="M70 66 L58 72 L70 80 L82 72Z"
          fill="#0d9488"
        />
        <path
          d="M48 95 L32 188 L46 194 L54 120Z"
          fill="#fdba74"
        />
        <path
          d="M88 100 L108 88 L118 96 L92 118Z"
          fill="#fdba74"
        />
        <ellipse cx="38" cy="192" rx="11" ry="6" fill="#dc2626" />
        <ellipse cx="112" cy="98" rx="10" ry="5" fill="#dc2626" />
        <rect x="24" y="78" width="26" height="32" rx="5" fill="#dc2626" />
        <path d="M37 78 L37 70 Q44 68 50 74" fill="none" stroke="#991b1b" strokeWidth="2" />
      </motion.g>
    </svg>
  )
}

/** Flat vector man — orange polo, tan pants, glasses, teal gift box only (no bouquet) */
function ManIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 140 220" className={className} aria-hidden>
      <motion.g
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
      >
        <circle cx="70" cy="42" r="24" fill="#fdba74" />
        <path
          d="M46 36 Q70 14 94 36 Q96 50 88 54 L52 54 Q44 50 46 36Z"
          fill="#171717"
        />
        <rect x="52" y="38" width="14" height="10" rx="2" fill="none" stroke="#262626" strokeWidth="2" />
        <rect x="74" y="38" width="14" height="10" rx="2" fill="none" stroke="#262626" strokeWidth="2" />
        <line x1="66" y1="43" x2="74" y2="43" stroke="#262626" strokeWidth="2" />
        <path
          d="M70 68 L42 112 L36 198 L52 202 L70 120 L88 202 L104 198 L98 112 Z"
          fill="#ea580c"
        />
        <path d="M70 68 L60 74 L70 82 L80 74Z" fill="#c2410c" />
        <path
          d="M52 125 L48 200 L62 202 L66 128Z"
          fill="#a8a29e"
        />
        <path
          d="M88 125 L92 200 L78 202 L74 128Z"
          fill="#a8a29e"
        />
        <ellipse cx="44" cy="200" rx="12" ry="7" fill="#1e3a5f" />
        <ellipse cx="96" cy="200" rx="12" ry="7" fill="#1e3a5f" />
        <rect x="48" y="108" width="44" height="40" rx="5" fill="#14b8a6" stroke="#0f7663" strokeWidth="2" />
        <line x1="70" y1="108" x2="70" y2="148" stroke="#fff" strokeWidth="3" />
        <line x1="48" y1="128" x2="92" y2="128" stroke="#fff" strokeWidth="3" />
        <path
          d="M70 100 L62 108 L70 112 L78 108Z"
          fill="#fdba74"
        />
      </motion.g>
    </svg>
  )
}

function OrbitHearts({ className = '' }) {
  const hearts = [0, 60, 120, 180, 240, 300]
  return (
    <motion.div
      className={`relative ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 48, repeat: Infinity, ease: 'linear' }}
    >
      {hearts.map((deg, i) => (
        <motion.span
          key={deg}
          className="absolute left-1/2 top-1/2 text-rose-400/90"
          style={{
            transform: `rotate(${deg}deg) translateY(-7.5rem) rotate(-${deg}deg)`,
          }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 2.4 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Heart className="h-5 w-5 fill-current drop-shadow-sm" strokeWidth={0} />
        </motion.span>
      ))}
    </motion.div>
  )
}

/** Replaces static “illustration couple” with photo + orbit hearts + soft orbs */
function AnimatedLoveShowcase() {
  const img =
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1400&q=82'

  return (
    <div className="relative mx-auto max-w-lg py-8 md:max-w-xl">
      <motion.div
        className="pointer-events-none absolute -left-10 top-1/4 h-40 w-40 rounded-full bg-rose-400/25 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="pointer-events-none absolute -right-6 bottom-10 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.25, 0.45, 0.25] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="relative flex min-h-[260px] items-center justify-center md:min-h-[320px]">
        <OrbitHearts className="absolute z-0 flex h-52 w-52 md:h-72 md:w-72" />

        <motion.div
          className="relative z-10 w-full max-w-sm overflow-hidden rounded-[2rem] border border-white/40 bg-white/10 shadow-2xl shadow-rose-900/20 ring-1 ring-rose-200/30 backdrop-blur-sm md:max-w-md"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="relative aspect-[4/5] w-full"
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={img}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-rose-950/75 via-rose-900/15 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <p className="font-display text-sm font-medium italic text-rose-100/95">
                “Every sunset hits different when you share it.”
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-3"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        {['Private tables', 'Quiet villas', 'Surprise touches'].map((label, i) => (
          <motion.span
            key={label}
            className="rounded-full border border-rose-200/80 bg-white/80 px-4 py-1.5 text-xs font-semibold text-rose-900 shadow-sm backdrop-blur-sm"
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            {label}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

export function RomanticGetaways() {
  const { openBooking } = useBooking()
  const [packages, setPackages] = useState(null)
  const [scope, setScope] = useState('global')
  const [heroMeet, setHeroMeet] = useState(false)

  useSeo({
    title: 'Romantic getaways & honeymoons',
    description:
      'Curated romantic escapes for couples — sunsets, private stays, and honeymoons crafted with heart by HoneybeeTrips.',
    canonical: '/romantic-getaways',
  })

  useEffect(() => {
    const t = window.setTimeout(() => setHeroMeet(true), 1200)
    return () => window.clearTimeout(t)
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

  const filteredPkgs = useMemo(() => {
    const rows = packages || []
    if (scope !== 'india') return rows.slice(0, 9)
    const india = rows.filter((p) => {
      const blob = `${p.location || ''} ${p.title || ''} ${p.category || ''}`.toLowerCase()
      return (
        blob.includes('india') ||
        blob.includes('indian') ||
        blob.includes('goa') ||
        blob.includes('kerala') ||
        blob.includes('rajasthan') ||
        blob.includes('udaipur') ||
        blob.includes('domestic')
      )
    })
    return (india.length > 0 ? india : rows).slice(0, 9)
  }, [packages, scope])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#fff5f7]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        aria-hidden
        style={{
          background: `
            radial-gradient(at 20% 20%, rgba(251, 113, 133, 0.25) 0px, transparent 50%),
            radial-gradient(at 80% 10%, rgba(244, 63, 94, 0.18) 0px, transparent 45%),
            radial-gradient(at 70% 80%, rgba(192, 132, 252, 0.15) 0px, transparent 50%),
            radial-gradient(at 10% 70%, rgba(253, 164, 175, 0.2) 0px, transparent 48%)
          `,
        }}
      />

      <FallingPetals />

      {/* Hero — layered romantic photography + readable overlay */}
      <section className="relative z-20 overflow-hidden border-b border-rose-200/30">
        <div className="pointer-events-none absolute inset-0 z-0">
          <img
            src={HERO_LOVE_IMG_1}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-[center_30%]"
          />
          <img
            src={HERO_LOVE_IMG_2}
            alt=""
            className="absolute inset-0 h-full w-full scale-105 object-cover object-[60%_40%] opacity-45 mix-blend-soft-light"
          />
          <img
            src={HERO_LOVE_IMG_3}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center opacity-25 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-rose-200/80 via-pink-50/88 to-rose-50/92" />
          <div className="absolute inset-0 bg-gradient-to-r from-white/55 via-rose-50/40 to-white/50" />
          <div
            className="absolute inset-0 opacity-50 mix-blend-multiply"
            style={{
              background: `
                radial-gradient(at 30% 20%, rgba(236, 72, 153, 0.35) 0px, transparent 45%),
                radial-gradient(at 75% 60%, rgba(244, 63, 94, 0.25) 0px, transparent 50%),
                radial-gradient(at 50% 90%, rgba(192, 132, 252, 0.2) 0px, transparent 40%)
              `,
            }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-16 pt-6 sm:px-6 sm:pb-20 sm:pt-8 lg:px-8 lg:pb-24 lg:pt-10">
          <nav
            className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-rose-900/90 drop-shadow sm:text-sm"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-rose-600">
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link to="/packages" className="hover:text-rose-600">
              Themes
            </Link>
            <span aria-hidden>/</span>
            <span className="font-semibold text-rose-950">Romantic getaways</span>
          </nav>

          <div className="grid items-end gap-8 lg:grid-cols-12 lg:gap-4">
            <motion.div
              className="order-2 flex justify-center lg:order-1 lg:col-span-3 lg:justify-end lg:pr-2"
              initial={{ x: -120, opacity: 0.4 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <WomanIllustration className="h-48 w-36 drop-shadow-xl md:h-60 md:w-44 lg:h-64 lg:w-48" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55 }}
              className="order-1 text-center lg:order-2 lg:col-span-6 lg:pb-2"
            >
              <div className="mb-3 flex justify-center">
                <Heart className="h-8 w-8 fill-red-500 text-red-600 drop-shadow-sm md:h-9 md:w-9" strokeWidth={1.2} />
              </div>
              <p className="font-serif text-2xl font-bold text-rose-950 md:text-3xl">Start Your</p>
              <h1 className="font-sans text-5xl font-bold leading-tight text-pink-500 drop-shadow-sm md:text-6xl lg:text-7xl">
                Love Story
              </h1>
              <p className="mx-auto mt-3 max-w-xl font-serif text-base text-neutral-900 md:text-lg">
                Where <span className="font-semibold text-pink-500">Love</span> Meets the World&apos;s
                Grandeur
              </p>
              <p className="mx-auto mt-5 max-w-lg text-sm leading-relaxed text-neutral-600 md:text-base">
                We don&apos;t just create trips; we craft unforgettable honeymoon experiences.
                Discover romantic destinations for couples worldwide — from the pristine beaches of
                the Maldives to the royal heritage of Udaipur.
              </p>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={heroMeet ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                className="mx-auto mt-6 flex max-w-md items-start justify-center gap-2 text-left text-sm font-semibold text-rose-900 md:text-base"
              >
                <Heart
                  className="mt-0.5 h-5 w-5 shrink-0 fill-rose-500 text-rose-600"
                  strokeWidth={1}
                />
                <span>Together is where the journey begins — let&apos;s plan yours.</span>
              </motion.p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => openBooking({ destination: 'Romantic getaway' })}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-rose-700 px-7 py-3 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-600/35 transition hover:brightness-110"
                >
                  Plan your escape
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </button>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-rose-300 bg-white/90 px-6 py-3 text-sm font-semibold text-rose-900 shadow-sm backdrop-blur-sm transition hover:border-rose-500"
                >
                  Talk to a specialist
                </Link>
              </div>
            </motion.div>

            <motion.div
              className="order-3 flex justify-center lg:col-span-3 lg:justify-start lg:pl-2"
              initial={{ x: 120, opacity: 0.4 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <ManIllustration className="h-48 w-36 drop-shadow-xl md:h-60 md:w-44 lg:h-64 lg:w-48" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Story + animated visual (replaces static illustrations) */}
      <section className="relative z-20 border-y border-rose-100/90 bg-white/50 py-16 backdrop-blur-sm md:py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8">
          <AnimatedLoveShowcase />
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-800">
              <Sparkles className="h-3.5 w-3.5" />
              Our romance philosophy
            </div>
            <h2 className="mt-4 font-sans text-3xl font-bold text-neutral-900 sm:text-4xl">
              Why couples trust us with their{' '}
              <span className="text-rose-600">best chapter</span>
            </h2>
            <ul className="mt-8 space-y-6">
              {[
                {
                  title: 'Emotion-first curation',
                  text: 'The table with the better sunset, the room with more privacy — we obsess over those details.',
                },
                {
                  title: 'Thoughtful inclusions',
                  text: 'Welcome notes, spa timing, and local rituals that feel personal, not packaged.',
                },
                {
                  title: 'Always-on support',
                  text: 'Last-minute flowers or a rain plan — we’re one message away while you’re away.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                    <Heart className="h-5 w-5 fill-current" strokeWidth={0} />
                  </span>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="relative z-20 mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-xl shadow-rose-200/20 backdrop-blur-md md:flex-row md:items-center md:justify-between md:p-6">
          <div>
            <p className="text-lg font-bold text-neutral-900">
              Filter <span className="text-rose-600">escapes</span>
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-400">
              Find your perfect love story
            </p>
          </div>
          <div
            className="inline-flex rounded-full bg-rose-50/90 p-1 ring-1 ring-rose-100"
            role="group"
            aria-label="Destination scope"
          >
            <button
              type="button"
              onClick={() => setScope('global')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                scope === 'global'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                  : 'text-neutral-600 hover:text-rose-700'
              }`}
            >
              Global destinations
            </button>
            <button
              type="button"
              onClick={() => setScope('india')}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                scope === 'india'
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-md'
                  : 'text-neutral-600 hover:text-rose-700'
              }`}
            >
              Incredible India
            </button>
          </div>
          <p className="text-sm text-neutral-500 md:text-right">
            Showing {filteredPkgs.length} curated picks
          </p>
        </div>
      </section>

      {/* Package grid */}
      <section className="relative z-20 mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        {packages === null && (
          <p className="rounded-2xl border border-rose-100 bg-white/80 py-12 text-center text-neutral-600">
            Loading romantic escapes…
          </p>
        )}
        {packages !== null && filteredPkgs.length === 0 && (
          <p className="rounded-2xl border border-dashed border-rose-200 bg-white/80 py-12 text-center text-neutral-600">
            No packages yet — explore{' '}
            <Link to="/packages" className="font-semibold text-rose-600 underline">
              all packages
            </Link>{' '}
            or get in touch.
          </p>
        )}
        {packages !== null && filteredPkgs.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPkgs.map((pkg, pi) => {
              const slug = pkg.slug || slugify(pkg.title || pkg.id)
              const img =
                mediaUrl(pkg.image_path) ||
                mediaUrl(pkg.cover_image) ||
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=82'
              const perks = String(pkg.highlights || '')
                .split(/\r?\n|,/)
                .map((v) => v.trim())
                .filter(Boolean)
                .slice(0, 3)
              const bullets =
                perks.length > 0
                  ? perks
                  : [
                      `Covering: ${pkg.location || 'Curated route'}`,
                      'Curated experiences',
                      'Seamless travel',
                    ]
              const badges = [
                pkg.is_trending ? 'Trending' : null,
                pkg.is_curated ? 'Curated' : null,
                pkg.is_underrated ? 'Great value' : null,
              ].filter(Boolean)
              const badgeColors = {
                Trending: 'bg-amber-500',
                Curated: 'bg-rose-500',
                'Great value': 'bg-emerald-500',
              }

              return (
                <motion.article
                  key={pkg.id}
                  initial={{ opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-20px' }}
                  transition={{ duration: 0.45, delay: pi * 0.05 }}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-rose-100/90 bg-white shadow-lg shadow-rose-100/60"
                >
                  <Link
                    to={`/packages/${slug}`}
                    className="relative block aspect-[16/11] overflow-hidden"
                  >
                    <img
                      src={img}
                      alt=""
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-rose-950/50 to-transparent opacity-90" />
                    {badges.length > 0 && (
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white ${badgeColors[b] || 'bg-rose-500'}`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                    <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/20 text-white backdrop-blur-sm transition group-hover:bg-white/35">
                      <Heart className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
                        <MapPin className="h-3 w-3 text-rose-300" />
                        {(pkg.location || 'Worldwide').split(',')[0]}
                      </span>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-rose-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-md">
                        <Clock className="h-3 w-3" />
                        {pkg.duration || 'Custom'}
                      </span>
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col bg-gradient-to-b from-white to-rose-50/40 p-5">
                    <h3 className="font-display text-lg font-semibold text-neutral-900">
                      <Link
                        to={`/packages/${slug}`}
                        className="hover:text-rose-600"
                      >
                        {pkg.title || 'Untitled package'}
                      </Link>
                    </h3>
                    <ul className="mt-3 space-y-1.5 text-sm text-rose-700/90">
                      {bullets.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="text-rose-400">●</span>
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-rose-100/80 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                          Curated price
                        </p>
                        <p className="text-xl font-bold text-rose-600">
                          ₹{formatInr(pkg.price)}
                        </p>
                      </div>
                      <Link
                        to={`/packages/${slug}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md transition hover:brightness-110"
                        aria-label={`View ${pkg.title}`}
                      >
                        <ArrowRight className="h-5 w-5" strokeWidth={2.5} />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </div>
        )}
      </section>

      <section className="relative z-20 border-t border-rose-100 bg-white/70 py-16 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-sans text-2xl font-bold text-neutral-900 sm:text-3xl">
            Ready to write your next{' '}
            <span className="text-rose-600">chapter together?</span>
          </h2>
          <button
            type="button"
            onClick={() => openBooking({ destination: 'Romantic getaway consultation' })}
            className="mt-6 inline-flex rounded-full bg-gradient-to-r from-rose-500 to-rose-700 px-8 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-rose-400/30"
          >
            Talk to a specialist
          </button>
          <p className="mt-6 flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
            <BookOpen className="h-4 w-4 text-rose-500" />
            Travel insights & love stories — coming to our blog soon
          </p>
        </div>
      </section>
    </div>
  )
}
