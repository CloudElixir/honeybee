import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Check,
  Clock,
  Crown,
  Heart,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
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

const HERO_IMG =
  'https://images.unsplash.com/photo-1526779259212-939e23800825?auto=format&fit=crop&w=1600&q=82'

export function GroupDepartures() {
  const { openBooking } = useBooking()
  const [packages, setPackages] = useState(null)
  const [scope, setScope] = useState('overseas')

  useSeo({
    title: 'Group departures & escorted tours',
    description:
      'Fixed-date group journeys with expert coordination, verified safety, and curated experiences — HoneybeeTrips.',
    canonical: '/group-departures',
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
    if (scope !== 'mainland') {
      const intl = rows.filter(
        (p) => !String(p.category || '').toLowerCase().includes('domestic')
      )
      return (intl.length > 0 ? intl : rows).slice(0, 12)
    }
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
    return (dom.length > 0 ? dom : rows).slice(0, 12)
  }, [packages, scope])

  const scrollToDepartures = () => {
    document.getElementById('upcoming-departures')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-amber-50/90 via-neutral-50 to-amber-100/40 text-neutral-900">
      {/* Decorative mesh */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.4]"
        aria-hidden
        style={{
          background: `
            radial-gradient(at 15% 20%, rgba(255, 193, 7, 0.35) 0px, transparent 45%),
            radial-gradient(at 85% 15%, rgba(0, 0, 0, 0.06) 0px, transparent 40%),
            radial-gradient(at 70% 80%, rgba(255, 193, 7, 0.2) 0px, transparent 50%)
          `,
        }}
      />

      {/* Hero */}
      <section className="relative z-10 border-b-4 border-neutral-950 bg-gradient-to-br from-white via-amber-50/50 to-white">
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 bg-honey/25 blur-3xl md:h-56 md:w-56" />
        <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rotate-12 rounded-3xl border-4 border-honey/40" />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-14 lg:px-8 lg:py-16">
          <div className="relative rounded-[2rem] border-2 border-neutral-950/10 bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8 lg:p-10">
            <div className="absolute -right-1 -top-1 h-16 w-16 rounded-br-full bg-honey shadow-lg ring-2 ring-neutral-950/10" />

            <nav
              className="mb-6 flex flex-wrap gap-1.5 text-xs font-medium text-neutral-600"
              aria-label="Breadcrumb"
            >
              <Link to="/" className="hover:text-neutral-950">
                Home
              </Link>
              <span className="text-honey-dark" aria-hidden>
                /
              </span>
              <Link to="/packages" className="hover:text-neutral-950">
                Themes
              </Link>
              <span className="text-honey-dark" aria-hidden>
                /
              </span>
              <span className="font-semibold text-neutral-950">Group departures</span>
            </nav>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-neutral-950">
              <span className="rounded-full bg-honey px-2 py-0.5 text-[10px] text-neutral-950">
                Fixed dates
              </span>{' '}
              <span className="text-neutral-500">•</span> curated groups
            </p>
            <h1 className="mt-4 font-sans text-3xl font-extrabold leading-[1.1] tracking-tight text-neutral-950 sm:text-4xl lg:text-[2.6rem]">
              Group departures &{' '}
              <span className="relative inline-block">
                <span className="relative z-10">escorted tours</span>
                <span className="absolute -bottom-1 left-0 right-0 z-0 h-3 bg-honey/80" aria-hidden />
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-700 sm:text-base">
              Hand-crafted itineraries for explorers who believe the best stories are written
              together — professional coordination, expert guides, and a community of like-minded
              travellers on every departure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToDepartures}
                className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-bold text-honey shadow-lg transition hover:bg-neutral-800"
              >
                View departures
                <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => openBooking({ destination: 'Group departure enquiry' })}
                className="inline-flex items-center gap-2 rounded-full border-2 border-neutral-950 bg-honey px-5 py-3 text-sm font-bold text-neutral-950 shadow-md transition hover:bg-honey-dark"
              >
                Plan with us
              </button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-4">
              <div className="rounded-2xl border-2 border-neutral-950 bg-neutral-950 p-4 text-honey shadow-md">
                <p className="text-2xl font-black">1.2k+</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-honey-light/90">
                  Global explorers
                </p>
              </div>
              <div className="rounded-2xl border-2 border-honey-dark bg-honey p-4 text-neutral-950 shadow-md">
                <p className="text-2xl font-black">92%</p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800">
                  Repeat travellers
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-1 rounded-[1.75rem] bg-gradient-to-br from-honey via-amber-200 to-honey-dark opacity-80 blur-sm" />
            <div className="relative overflow-hidden rounded-3xl border-4 border-neutral-950 shadow-2xl">
              <img
                src={HERO_IMG}
                alt=""
                className="aspect-[4/3] w-full object-cover sm:aspect-[5/4]"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-neutral-950/10 to-honey/10" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-honey px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-neutral-950 shadow-md">
                  <Crown className="h-3.5 w-3.5" strokeWidth={2} />
                  Exclusive access
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-honey bg-neutral-950/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-honey backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2} />
                  Verified safety
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dark feature band — black + honey */}
      <section
        className="relative z-10 overflow-hidden border-y-4 border-honey bg-neutral-950 py-14 text-amber-50"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, rgba(255, 193, 7, 0.14) 1px, transparent 0),
            linear-gradient(165deg, #0a0a0a 0%, #171717 45%, #0a0a0a 100%)
          `,
          backgroundSize: '24px 24px, auto',
        }}
      >
        <div className="pointer-events-none absolute right-10 top-10 h-40 w-40 rounded-full bg-honey/10 blur-3xl" />
        <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-block rounded-full border border-honey/50 bg-honey/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-honey">
                Fixed dates — guaranteed
              </span>
              <h2 className="mt-4 font-sans text-3xl font-extrabold leading-tight text-white sm:text-4xl">
                Every departure.{' '}
                <span className="text-honey">Every detail.</span>{' '}
                <span className="text-neutral-400">Taken care of.</span>
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-neutral-400 sm:text-base">
                Group travel elevated — not just a tour, but a seamless guided adventure with expert
                planning, shared experiences, and departures you can count on.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                { title: '100+ global destinations', sub: 'Across six continents' },
                { title: '100% departure guarantee', sub: 'We run what we publish' },
                { title: 'Elite small groups', sub: 'Intimate & curated' },
                { title: '5★ rated experience', sub: 'By 1,200+ travellers' },
              ].map((cell, i) => (
                <motion.div
                  key={cell.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border-2 border-honey/30 bg-neutral-900/80 p-4 shadow-lg sm:p-5"
                >
                  <p className="text-sm font-bold leading-snug text-honey sm:text-base">{cell.title}</p>
                  <p className="mt-1 text-xs text-neutral-400">{cell.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming departures */}
      <section id="upcoming-departures" className="relative z-10 scroll-mt-20 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 border-b-2 border-neutral-950/10 pb-10 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.35em] text-neutral-500">
                <span className="h-1 w-10 bg-honey" aria-hidden />
                Curation 2025/26
              </p>
              <h2 className="mt-3 font-sans text-3xl font-extrabold sm:text-4xl">
                <span className="text-neutral-950">Upcoming </span>
                <span className="bg-gradient-to-r from-amber-500 via-honey to-honey-dark bg-clip-text text-transparent">
                  departures
                </span>
              </h2>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-neutral-600 lg:text-right">
              Signature group journeys with fixed dates and coordinated logistics across the
              destinations travellers ask for most.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-6 rounded-3xl border-2 border-neutral-950/10 bg-gradient-to-br from-white to-amber-50/60 p-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <p className="text-lg font-black text-neutral-950">
                Filter <span className="text-honey-dark">journeys</span>
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-neutral-500">
                Find your perfect escape
              </p>
            </div>
            <div
              className="inline-flex rounded-full border-2 border-neutral-950 bg-neutral-950 p-1"
              role="group"
              aria-label="Region filter"
            >
              <button
                type="button"
                onClick={() => setScope('overseas')}
                className={`rounded-full px-5 py-2.5 text-sm font-bold transition ${
                  scope === 'overseas'
                    ? 'bg-honey text-neutral-950 shadow-inner'
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
                    ? 'bg-honey text-neutral-950 shadow-inner'
                    : 'text-amber-100/80 hover:text-honey'
                }`}
              >
                Mainland India
              </button>
            </div>
            <p className="text-sm text-neutral-600">
              Showing <span className="font-black text-neutral-950">{filteredPkgs.length}</span>{' '}
              departures
            </p>
          </div>

          {packages === null && (
            <p className="mt-10 rounded-2xl border-2 border-dashed border-neutral-300 bg-amber-50/50 py-12 text-center text-neutral-600">
              Loading departures…
            </p>
          )}
          {packages !== null && filteredPkgs.length === 0 && (
            <p className="mt-10 rounded-2xl border-2 border-dashed border-neutral-950/20 py-12 text-center text-neutral-600">
              No packages match yet —{' '}
              <Link to="/packages" className="font-black text-neutral-950 underline decoration-honey decoration-2">
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
                  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=82'
                const perks = String(pkg.highlights || '')
                  .split(/\r?\n|,/)
                  .map((v) => v.trim())
                  .filter(Boolean)
                  .slice(0, 1)
                const covering =
                  perks[0] || `Covering: ${(pkg.location || 'Curated route').split(',')[0]}`
                const badges = [
                  pkg.is_trending ? 'Trending' : null,
                  pkg.is_curated ? 'Curated' : null,
                  !pkg.is_trending && !pkg.is_curated ? 'Great value' : null,
                ].filter(Boolean)
                const badgeClass = {
                  Trending: 'bg-honey text-neutral-950',
                  Curated: 'bg-neutral-950 text-honey',
                  'Great value': 'bg-amber-600 text-white',
                }

                return (
                  <motion.article
                    key={pkg.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-24px' }}
                    transition={{ duration: 0.4, delay: pi * 0.04 }}
                    className="group flex flex-col overflow-hidden rounded-3xl border-2 border-neutral-950/10 bg-white shadow-card ring-1 ring-honey/20"
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
                      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/55 to-transparent opacity-95" />
                      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                        {badges.map((b) => (
                          <span
                            key={b}
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${badgeClass[b] || 'bg-honey text-neutral-950'}`}
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                      <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border-2 border-honey bg-neutral-950/80 text-honey backdrop-blur-sm">
                        <Heart className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                        <span className="inline-flex max-w-[60%] items-center gap-1 truncate rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-honey backdrop-blur-sm">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {(pkg.location || 'Worldwide').split(',')[0]}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-honey px-2.5 py-1 text-[10px] font-black text-neutral-950">
                          <Clock className="h-3 w-3" />
                          {pkg.duration || 'Custom'}
                        </span>
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col bg-gradient-to-b from-white to-amber-50/30 p-5">
                      <h3 className="font-display text-base font-black uppercase tracking-tight text-neutral-950 sm:text-lg">
                        <Link to={`/packages/${slug}`} className="hover:text-honey-dark">
                          {pkg.title || 'Group departure'}
                        </Link>
                      </h3>
                      <ul className="mt-3 space-y-1.5 text-sm text-neutral-700">
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          <span>{covering}</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          <span>Curated experiences</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-honey-dark">●</span>
                          <span>Seamless travel</span>
                        </li>
                      </ul>
                      <div className="mt-5 flex items-end justify-between gap-3 border-t-2 border-neutral-950/5 pt-4">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500">
                            Curated price
                          </p>
                          <p className="text-xl font-black text-neutral-950">₹{formatInr(pkg.price)}</p>
                        </div>
                        <Link
                          to={`/packages/${slug}`}
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-honey shadow-md transition hover:bg-honey hover:text-neutral-950"
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

      {/* Journey steps */}
      <section className="relative z-10 border-t-4 border-honey bg-gradient-to-b from-amber-50/80 to-white py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.28em] text-neutral-950">
                <span className="h-1 w-8 bg-neutral-950" aria-hidden />
                <span className="text-honey-dark">The group experience</span>
              </p>
              <h2 className="mt-3 font-sans text-3xl font-black text-neutral-950 sm:text-4xl">
                How your journey unfolds
              </h2>
            </div>
            <p className="text-sm leading-relaxed text-neutral-600 lg:pt-8">
              From the moment you book to the final farewell — here&apos;s what a Honeybee group
              departure feels like, step by step.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                n: '01',
                icon: Check,
                iconBg: 'bg-neutral-950 text-honey',
                title: 'Pick your date',
                text: 'Choose a departure that fits your calendar — fixed windows, clear inclusions, no guesswork.',
              },
              {
                n: '02',
                icon: Users,
                iconBg: 'bg-honey text-neutral-950',
                title: 'Meet your crew',
                text: 'Small groups, real camaraderie — we keep numbers tight so the trip feels shared, not crowded.',
              },
              {
                n: '03',
                icon: MapPin,
                iconBg: 'bg-neutral-950 text-honey',
                title: 'We handle everything',
                text: 'Stays, transfers, pacing, and guides — pre-arranged so you focus on the views, not the logistics.',
              },
              {
                n: '04',
                icon: Star,
                iconBg: 'bg-honey-dark text-neutral-950',
                title: 'Live the story',
                text: 'Itineraries built for exploration — memorable stops without the rushed conveyor-belt feel.',
              },
            ].map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="relative overflow-hidden rounded-2xl border-2 border-neutral-950/10 bg-white p-6 shadow-md"
              >
                <div className="absolute right-0 top-0 h-20 w-20 translate-x-6 -translate-y-6 rounded-full bg-honey/25" />
                <span className="absolute left-4 top-4 font-display text-5xl font-black text-amber-100">
                  {step.n}
                </span>
                <div
                  className={`relative ml-auto flex h-10 w-10 items-center justify-center rounded-xl border-2 border-neutral-950/10 ${step.iconBg}`}
                >
                  <step.icon className="h-5 w-5" strokeWidth={2.2} />
                </div>
                <h3 className="relative mt-6 font-bold text-neutral-950">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-neutral-600">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 bg-neutral-950 py-16 text-white">
        <div className="pointer-events-none absolute inset-0 opacity-30">
          <div className="absolute left-1/4 top-0 h-px w-32 bg-honey" />
          <div className="absolute bottom-8 right-1/4 h-24 w-24 rounded-full border-2 border-honey/40" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-sans text-2xl font-black sm:text-3xl">
            <span className="text-white">Ready to join a </span>
            <span className="text-honey">global adventure?</span>
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => openBooking({ destination: 'Group departure' })}
              className="inline-flex rounded-full bg-honey px-8 py-3.5 text-sm font-black uppercase tracking-wide text-neutral-950 shadow-lg shadow-honey/30 transition hover:bg-honey-dark"
            >
              Request a callback
            </button>
            <Link
              to="/contact"
              className="inline-flex items-center rounded-full border-2 border-honey/60 bg-transparent px-6 py-3.5 text-sm font-bold text-honey transition hover:bg-honey/10"
            >
              Contact us
            </Link>
          </div>
          <p className="mt-8 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-500">
            <Sparkles className="h-4 w-4 text-honey" />
            HoneybeeTrips — group departures you can trust
          </p>
        </div>
      </section>
    </div>
  )
}
