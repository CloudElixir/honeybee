import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Check,
  Clock,
  Compass,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Users,
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

const HERO_FAMILY =
  'https://images.unsplash.com/photo-1511895426328-dc821679aba0?auto=format&fit=crop&w=1600&q=82'

const ACTIVITY_FILTERS = [
  { id: 'all', label: 'All fun' },
  { id: 'beach', label: 'Beach & pools', keys: ['beach', 'island', 'coast', 'sea', 'maldives', 'goa', 'bali'] },
  { id: 'wildlife', label: 'Wildlife & nature', keys: ['wild', 'safari', 'jungle', 'forest', 'national', 'wildlife'] },
  { id: 'culture', label: 'Culture walks', keys: ['heritage', 'temple', 'museum', 'city', 'historic', 'culture'] },
  { id: 'theme', label: 'Theme thrills', keys: ['theme', 'park', 'disney', 'universal', 'adventure'] },
  { id: 'slow', label: 'Slow travel', keys: ['slow', 'village', 'countryside', 'relax', 'wellness'] },
]

function matchesActivity(pkg, activityId) {
  if (activityId === 'all') return true
  const def = ACTIVITY_FILTERS.find((a) => a.id === activityId)
  if (!def?.keys) return true
  const blob = `${pkg.title || ''} ${pkg.location || ''} ${pkg.highlights || ''}`.toLowerCase()
  return def.keys.some((k) => blob.includes(k))
}

export function FamilyFunventure() {
  const { openBooking } = useBooking()
  const [packages, setPackages] = useState(null)
  const [scope, setScope] = useState('overseas')
  const [activity, setActivity] = useState('all')

  useSeo({
    title: 'Family funventure holidays',
    description:
      'Family-first trips with kid-friendly pacing, trusted stays, and memories across generations — HoneybeeTrips.',
    canonical: '/family-funventure',
  })

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
    let base = rows
    if (scope === 'mainland') {
      const dom = rows.filter((p) => {
        const blob = `${p.location || ''} ${p.title || ''} ${p.category || ''}`.toLowerCase()
        return (
          blob.includes('domestic') ||
          blob.includes('india') ||
          blob.includes('goa') ||
          blob.includes('kerala') ||
          blob.includes('rajasthan')
        )
      })
      base = dom.length > 0 ? dom : rows
    } else {
      const intl = rows.filter(
        (p) => !String(p.category || '').toLowerCase().includes('domestic')
      )
      base = intl.length > 0 ? intl : rows
    }
    const byAct = base.filter((p) => matchesActivity(p, activity))
    return (byAct.length > 0 ? byAct : base).slice(0, 12)
  }, [packages, scope, activity])

  const scrollToAdventures = () => {
    document.getElementById('curated-adventures')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-amber-50/95 via-white to-amber-50/50 text-neutral-900">
      <div
        className="pointer-events-none fixed inset-0 opacity-50"
        aria-hidden
        style={{
          background: `
            radial-gradient(at 20% 30%, rgba(255, 193, 7, 0.22) 0px, transparent 50%),
            radial-gradient(at 90% 20%, rgba(0, 0, 0, 0.04) 0px, transparent 45%)
          `,
        }}
      />

      {/* Hero */}
      <section className="relative z-10 border-b-4 border-neutral-950 bg-gradient-to-br from-white via-amber-50/40 to-white">
        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-16">
          <div>
            <nav
              className="mb-6 flex flex-wrap gap-1.5 text-xs font-medium text-neutral-600"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-neutral-950">
                Home
              </Link>
              <span className="text-honey-dark">/</span>
              <Link to="/packages" className="hover:text-neutral-950">
                Themes
              </Link>
              <span className="text-honey-dark">/</span>
              <span className="font-semibold text-neutral-950">Family funventure</span>
            </nav>
            <p className="text-[11px] font-black uppercase tracking-[0.26em] text-teal-700">
              For all ages • Curated fun
            </p>
            <h1 className="mt-3 font-sans text-3xl font-extrabold leading-[1.12] tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.55rem]">
              Family holidays &{' '}
              <span className="bg-gradient-to-r from-honey via-amber-400 to-honey-dark bg-clip-text text-transparent">
                funventures
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-700 sm:text-base">
              Where every journey becomes a joyful family memory — handpicked routes with space for
              naps, snacks, and “wow” moments for kids, parents, and grandparents together.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToAdventures}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-honey to-honey-dark px-6 py-3 text-sm font-black text-neutral-950 shadow-lg transition hover:brightness-105"
              >
                Start exploring
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => openBooking({ destination: 'Family funventure' })}
                className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-950 bg-white px-5 py-3 text-sm font-bold text-neutral-950 transition hover:bg-neutral-950 hover:text-honey"
              >
                Plan your trip
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-8 border-t-2 border-neutral-950/10 pt-8">
              <div>
                <p className="text-2xl font-black text-neutral-950">500+</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Family trips
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-honey-dark">Joyful</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Memories
                </p>
              </div>
              <div>
                <p className="text-2xl font-black text-teal-700">100+</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                  Destinations
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-2 -top-2 flex h-14 w-14 items-center justify-center rounded-full bg-honey text-neutral-950 shadow-lg ring-4 ring-white">
              <Sparkles className="h-7 w-7" strokeWidth={2} />
            </div>
            <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-honey via-amber-200 to-teal-400/40 opacity-90 blur-sm" />
            <div className="relative overflow-hidden rounded-3xl border-4 border-neutral-950 shadow-2xl">
              <img
                src={HERO_FAMILY}
                alt=""
                className="aspect-[4/3] w-full object-cover object-[center_35%] sm:aspect-[5/4]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/55 via-amber-900/5 to-transparent" />
              <p className="absolute bottom-5 left-5 right-5 font-display text-lg font-semibold italic text-white drop-shadow-md sm:text-xl">
                “Little feet, big horizons — we pace the day for everyone.”
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Activity strip — like reference category bar */}
      <div className="relative z-10 border-b-2 border-neutral-950 bg-neutral-950 py-3">
        <div className="scrollbar-hide mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 sm:px-6 lg:px-8">
          {ACTIVITY_FILTERS.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => setActivity(a.id)}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide transition sm:text-sm ${
                activity === a.id
                  ? 'bg-honey text-neutral-950 shadow-md'
                  : 'bg-neutral-800 text-amber-100/90 hover:bg-neutral-700'
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter + adventures */}
      <section id="curated-adventures" className="relative z-10 scroll-mt-16 bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 rounded-3xl border-2 border-neutral-950/10 bg-gradient-to-br from-white to-amber-50/50 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-lg font-black text-neutral-950">
                Filter <span className="text-honey-dark">adventures</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                Find your perfect funventure
              </p>
            </div>
            <div
              className="inline-flex rounded-full border-2 border-neutral-950 bg-neutral-950 p-1"
              role="group"
              aria-label="Region"
            >
              <button
                type="button"
                onClick={() => setScope('overseas')}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  scope === 'overseas'
                    ? 'bg-honey text-neutral-950'
                    : 'text-amber-100/80 hover:text-honey'
                }`}
              >
                Overseas
              </button>
              <button
                type="button"
                onClick={() => setScope('mainland')}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  scope === 'mainland'
                    ? 'bg-honey text-neutral-950'
                    : 'text-amber-100/80 hover:text-honey'
                }`}
              >
                Mainland India
              </button>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-6 border-b-2 border-neutral-950/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-500">
                Curated for families
              </p>
              <h2 className="mt-2 font-sans text-3xl font-black sm:text-4xl">
                <span className="text-neutral-950">Curated </span>
                <span className="bg-gradient-to-r from-teal-600 via-honey-dark to-neutral-950 bg-clip-text text-transparent">
                  adventures
                </span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600 lg:text-right">
              Handpicked destinations with pacing that works for toddlers to grandparents — shared
              meals, downtime, and wow moments built in.
            </p>
          </div>

          {packages === null && (
            <p className="mt-10 rounded-2xl border-2 border-dashed border-neutral-200 bg-amber-50/50 py-12 text-center text-neutral-600">
              Loading adventures…
            </p>
          )}
          {packages !== null && filteredPkgs.length === 0 && (
            <p className="mt-10 rounded-2xl border-2 border-dashed py-12 text-center text-neutral-600">
              No matches for this combo —{' '}
              <button
                type="button"
                className="font-black text-neutral-950 underline"
                onClick={() => {
                  setActivity('all')
                  setScope('overseas')
                }}
              >
                reset filters
              </button>{' '}
              or{' '}
              <Link to="/packages" className="text-teal-700 underline">
                browse all packages
              </Link>
              .
            </p>
          )}
          {packages !== null && filteredPkgs.length > 0 && (
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPkgs.map((pkg, pi) => {
                const slug = pkg.slug || slugify(pkg.title || pkg.id)
                const img =
                  mediaUrl(pkg.image_path) ||
                  mediaUrl(pkg.cover_image) ||
                  'https://images.unsplash.com/photo-1476708046591-e0faea48c0f0?auto=format&fit=crop&w=900&q=82'
                const perks = String(pkg.highlights || '')
                  .split(/\r?\n|,/)
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .slice(0, 1)
                const covering =
                  perks[0] || `Covering: ${(pkg.location || 'Family route').split(',')[0]}`
                const badges = [
                  pkg.is_trending ? 'Trending' : null,
                  pkg.is_curated ? 'Kid-friendly' : null,
                  !pkg.is_trending && !pkg.is_curated ? 'Great value' : null,
                ].filter(Boolean)
                const badgeClass = {
                  Trending: 'bg-amber-500 text-neutral-950',
                  'Kid-friendly': 'bg-teal-600 text-white',
                  'Great value': 'bg-honey text-neutral-950',
                }

                return (
                  <motion.article
                    key={pkg.id}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ delay: pi * 0.04 }}
                    className="group flex flex-col overflow-hidden rounded-3xl border-2 border-neutral-950/10 bg-white shadow-card"
                  >
                    <Link to={`/packages/${slug}`} className="relative block aspect-[16/11] overflow-hidden">
                      <img
                        src={img}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/50 to-transparent" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${badgeClass[b] || 'bg-honey text-neutral-950'}`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/70 bg-white/20 text-white backdrop-blur-sm">
                        <Heart className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <span className="inline-flex max-w-[58%] items-center gap-1 truncate rounded-full bg-black/65 px-2.5 py-1 text-[10px] font-black uppercase text-honey">
                          <MapPin className="h-3 w-3 shrink-0" strokeWidth={2} />
                          {(pkg.location || 'Worldwide').split(',')[0]}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-honey px-2.5 py-1 text-[10px] font-black text-neutral-950">
                          <Clock className="h-3 w-3" />
                          {pkg.duration || 'Custom'}
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-base font-black text-neutral-950 sm:text-lg">
                        <Link to={`/packages/${slug}`} className="hover:text-teal-700">
                          {pkg.title || 'Family package'}
                        </Link>
                      </h3>
                      <ul className="mt-3 space-y-1 text-sm text-neutral-600">
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          {covering}
                        </li>
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          Curated for families
                        </li>
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          Seamless travel days
                        </li>
                      </ul>
                      <div className="mt-5 flex items-end justify-between border-t-2 border-neutral-950/5 pt-4">
                        <div>
                          <p className="text-[10px] font-black uppercase text-neutral-500">
                            From
                          </p>
                          <p className="text-xl font-black text-neutral-950">₹{formatInr(pkg.price)}</p>
                        </div>
                        <Link
                          to={`/packages/${slug}`}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-honey transition hover:bg-honey hover:text-neutral-950"
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
        </div>
      </section>

      {/* Bento — every family */}
      <section className="relative z-10 border-y-4 border-honey bg-neutral-950 py-14 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-black uppercase tracking-[0.35em] text-honey">
            Why families love us
          </p>
          <h2 className="mt-3 text-center font-sans text-3xl font-black sm:text-4xl">
            Every family.{' '}
            <span className="bg-gradient-to-r from-honey to-amber-200 bg-clip-text text-transparent">
              Every adventure.
            </span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-2">
            <div className="rounded-3xl bg-gradient-to-br from-honey to-amber-400 p-6 text-neutral-950 sm:col-span-2 sm:row-span-2 lg:min-h-[220px]">
              <p className="text-xs font-black uppercase tracking-widest opacity-80">500+ trips</p>
              <p className="mt-4 font-sans text-2xl font-black leading-tight sm:text-3xl">
                Fun that works for everyone.
              </p>
              <p className="mt-3 max-w-sm text-sm font-medium text-neutral-900/90">
                Toddlers, teens, parents & grandparents — we balance energy, rest, and shared “we did
                it” moments.
              </p>
            </div>
            <div className="flex flex-col justify-between rounded-3xl bg-teal-700 p-5 sm:min-h-[140px]">
              <Compass className="h-8 w-8 text-honey" strokeWidth={2} />
              <p className="mt-4 text-sm font-black uppercase leading-snug">
                100% kid-aware activities
              </p>
            </div>
            <div className="rounded-3xl bg-honey p-5 text-neutral-950">
              <Sparkles className="h-7 w-7" strokeWidth={2} />
              <p className="mt-3 text-sm font-black uppercase">Joyful memories</p>
            </div>
            <div className="rounded-3xl bg-neutral-800 p-5 ring-2 ring-honey/40 sm:col-span-2 lg:col-span-2">
              <Users className="h-7 w-7 text-honey" strokeWidth={2} />
              <p className="mt-2 text-sm font-black uppercase text-honey">3+ generations</p>
              <p className="mt-1 text-xs text-neutral-400">
                Room configurations & meals that keep the whole crew happy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust trio */}
      <section className="relative z-10 bg-amber-50/60 py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <span className="text-2xl" aria-hidden>
              🌴
            </span>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.25em] text-teal-800">
              Peace of mind, packed in
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                badge: 'Trusted',
                title: 'Safety first',
                text: 'Family-friendly stays and 24/7 support while you’re on the road.',
                icon: Shield,
                ring: 'bg-amber-100 text-amber-900',
              },
              {
                badge: 'Multi-gen',
                title: 'All ages welcome',
                text: 'Pacing and picks that work for little legs and slower strolls too.',
                icon: Users,
                ring: 'bg-teal-100 text-teal-900',
              },
              {
                badge: 'Captured',
                title: 'Memory making',
                text: 'Big views, small rituals — the stories you retell at every reunion.',
                icon: Heart,
                ring: 'bg-rose-100 text-rose-800',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border-2 border-white bg-white p-6 shadow-md"
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${card.ring}`}
                >
                  {card.badge}
                </span>
                <div className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-950 text-honey">
                  <card.icon className="h-6 w-6" strokeWidth={2} />
                </div>
                <h3 className="mt-4 font-bold text-neutral-950">{card.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{card.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { step: '1', title: 'Tell us your dream', sub: 'Dates, ages & must-dos' },
              { step: '2', title: 'We tailor the fun', sub: 'Routes, rest & surprises' },
              { step: '3', title: 'Pack & go', sub: 'Clear checklist & support' },
              { step: '4', title: 'Memories forever', sub: 'Album-ready moments' },
            ].map((s) => (
              <div
                key={s.step}
                className="rounded-2xl border-2 border-neutral-950/10 bg-white px-4 py-4 text-center shadow-sm"
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-honey-dark">
                  Step {s.step}
                </p>
                <p className="mt-1 font-bold text-neutral-950">{s.title}</p>
                <p className="mt-1 text-xs text-neutral-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stories teaser */}
      <section className="relative z-10 bg-white py-14">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-honey-dark">
              <BookOpen className="h-4 w-4" />
              Travel insights
            </p>
            <h2 className="mt-2 font-sans text-2xl font-black sm:text-3xl">
              <span className="text-neutral-950">Stories & </span>
              <span className="text-honey-dark">inspiration</span>
            </h2>
          </div>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1 text-sm font-bold text-neutral-600 hover:text-neutral-950"
          >
            View all articles
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mx-auto mt-8 grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { t: 'First flight with a toddler', d: 'Airport hacks & calm boarding tips.' },
            { t: 'Beach days without meltdowns', d: 'Shade, snacks & swim windows that work.' },
            { t: 'Grandparents on the road', d: 'Comfort breaks everyone actually enjoys.' },
          ].map((story) => (
            <Link
              key={story.t}
              to="/blogs"
              className="rounded-2xl border-2 border-neutral-950/10 bg-amber-50/50 p-5 transition hover:border-honey hover:bg-honey/20"
            >
              <p className="text-xs font-bold uppercase text-neutral-500">Coming soon</p>
              <p className="mt-2 font-bold text-neutral-950">{story.t}</p>
              <p className="mt-2 text-sm text-neutral-600">{story.d}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-black text-honey-dark">
                Read article <ArrowUpRight className="h-4 w-4" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 border-t-4 border-neutral-950 bg-gradient-to-r from-honey via-amber-300 to-honey py-14">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-sans text-2xl font-black text-neutral-950 sm:text-3xl">
            Ready for your next family chapter?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openBooking({ destination: 'Family funventure' })}
              className="rounded-full bg-neutral-950 px-8 py-3.5 text-sm font-black uppercase tracking-wide text-honey shadow-lg transition hover:bg-neutral-800"
            >
              Talk to us
            </button>
            <Link
              to="/contact"
              className="rounded-full border-2 border-neutral-950 bg-transparent px-6 py-3.5 text-sm font-bold text-neutral-950 hover:bg-neutral-950 hover:text-honey"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
