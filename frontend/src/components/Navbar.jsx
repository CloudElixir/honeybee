import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  ChevronRight,
  Search,
  User,
  ChevronDown,
} from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { fetchCmsItems, fetchPublic } from '../api/adminPublic'
import { slugFromLocationRaw } from '../utils/packageLocationGroups'

const navItems = [
  { key: 'international', label: 'International', chevron: true, to: '/international' },
  { key: 'domestic', label: 'Domestic', chevron: true, to: '/domestic' },
  { key: 'themes', label: 'Honeymoon', chevron: true, to: '/honeymoon-packages' },
  { key: 'visa', label: 'Visa', to: '/destinations?q=visa' },
]

const quickMenuItems = [
  { key: 'home', label: 'Home', to: '/' },
  { key: 'international', label: 'International', to: '/international' },
  { key: 'domestic', label: 'Domestic', to: '/domestic' },
  { key: 'honeymoon', label: 'Honeymoon', to: '/honeymoon-packages' },
  { key: 'visa', label: 'Visa', to: '/destinations?q=visa' },
  { key: 'packages', label: 'All Packages', to: '/packages' },
  { key: 'contact', label: 'Contact Us', to: '/contact' },
]

const internationalMega = {
  regions: [
    {
      name: 'Asia',
      destinations: [
        'Azerbaijan',
        'Bali',
        'Bhutan',
        'Cambodia',
        'China',
        'Dubai',
        'Georgia',
        'Hong Kong',
        'Japan',
        'Kazakhstan',
        'Laos',
        'Malaysia',
        'Maldives',
        'Nepal',
        'Philippines',
        'Singapore',
        'Singapore & Malaysia',
        'South Korea',
        'Sri Lanka',
        'Thailand',
        'Vietnam',
      ],
    },
    {
      name: 'Africa',
      destinations: ['Egypt', 'Kenya', 'Kenya & Tanzania', 'Mauritius', 'Seychelles', 'South Africa', 'Tanzania'],
    },
    {
      name: 'Europe',
      destinations: ['Switzerland', 'France', 'Italy', 'UK & Scotland', 'Central Europe'],
    },
    {
      name: 'Oceania',
      destinations: ['Australia', 'New Zealand'],
    },
  ],
}

const domesticMega = {
  regions: [
    {
      name: 'Domestic',
      destinations: [
        '3 Sisters',
        'Andaman',
        'Arunachal Pradesh',
        'Goa',
        'Gujarat',
        'Himachal',
        'Karnataka',
        'Kashmir',
        'Kerala',
        'Ladakh',
        'Lakshadweep',
        'Maharashtra',
        'Meghalaya',
        'Orissa',
        'Punjab',
        'Rajasthan',
        'Sikkim',
        'Tamil Nadu',
        'Uttar Pradesh',
        'Uttarakhand',
        'Varanasi',
        'West Bengal',
      ],
    },
  ],
}

const themeMega = {
  regions: [
    {
      name: 'Romantic & honeymoon',
      destinations: ['Bali escapes', 'Maldives overwater', 'European romance', 'Himalayan hideaways'],
    },
    {
      name: 'Family & fun',
      destinations: ['Theme park holidays', 'Island funventures', 'Wildlife & safari', 'Snow play trips'],
    },
    {
      name: 'Offbeat & adventure',
      destinations: ['Treks & trails', 'Road trip circuits', 'Diving & surf', 'Slow travel retreats'],
    },
    {
      name: 'Spiritual & wellness',
      destinations: ['Char Dham & yatras', 'Ayurveda retreats', 'Yoga by the sea', 'Mindful getaways'],
    },
  ],
}

function buildMegaFromCms(items, scope) {
  const rows = (items || []).filter((i) => (i.scope || 'global') === scope)
  if (rows.length === 0) return null
  const grouped = new Map()
  rows.forEach((row) => {
    const title = String(row.title || '').trim()
    if (!title) return
    const region = (row.subtitle || 'General').trim() || 'General'
    if (!grouped.has(region)) grouped.set(region, [])
    grouped.get(region).push(title)
  })
  if (grouped.size === 0) return null
  return {
    regions: Array.from(grouped.entries()).map(([name, destinations]) => ({ name, destinations })),
  }
}

function buildMegaFromDestinations(destinations, scope) {
  const list = Array.isArray(destinations) ? destinations : []
  if (list.length === 0) return null
  const normalizedScope = scope === 'domestic' ? 'domestic' : 'international'
  const domesticMatcher = /(india|andaman|goa|kerala|kashmir|ladakh|rajasthan|sikkim|himachal|meghalaya|uttar|varanasi|gujarat|punjab|tamil|lakshadweep)/i
  const filtered = list.filter((d) => {
    const label = `${d.name || ''} ${d.country || ''}`
    const isDomestic = domesticMatcher.test(label)
    return normalizedScope === 'domestic' ? isDomestic : !isDomestic
  })
  if (filtered.length === 0) return null
  const grouped = new Map()
  filtered.forEach((d) => {
    const label = String(d.name || d.country || '').trim()
    if (!label) return
    const region = String(d.continent || (normalizedScope === 'domestic' ? 'Domestic' : 'International')).trim() || 'General'
    if (!grouped.has(region)) grouped.set(region, [])
    grouped.get(region).push(label)
  })
  const regions = Array.from(grouped.entries()).map(([name, destinationsInRegion]) => ({
    name,
    destinations: Array.from(new Set(destinationsInRegion))
      .map((s) => String(s || '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b)),
  }))
  const nonEmpty = regions.filter((r) => r.destinations.length > 0)
  if (nonEmpty.length === 0) return null
  // API rows often omit `continent`, so everything lands in one "International" bucket and the
  // mega-menu loses Asia / Africa / Europe / Oceania. Fall back so the static regional layout stays.
  if (normalizedScope === 'international' && nonEmpty.length === 1) {
    const bucket = String(nonEmpty[0].name || '')
      .trim()
      .toLowerCase()
    if (bucket === 'international' || bucket === 'general') {
      return null
    }
  }
  return { regions: nonEmpty }
}

const normalizeDestinationLabel = (value) =>
  String(value || '')
    .split(/[–-]/)[0]
    .replace(/\b(escapes?|overwater|romance|hideaways?)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()

export function Navbar({ announcementVisible = false }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [megaOpen, setMegaOpen] = useState(false)
  const [quickMenuOpen, setQuickMenuOpen] = useState(false)
  const [megaType, setMegaType] = useState('international')
  const [activeRegion, setActiveRegion] = useState(internationalMega.regions[0]?.name ?? '')
  const [megaCmsItems, setMegaCmsItems] = useState([])
  const [destinationsList, setDestinationsList] = useState([])
  const [packagesList, setPackagesList] = useState([])
  const megaCloseTimer = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { openBooking } = useBooking()
  const isHome = location.pathname === '/'
  const glassMode = isHome && !scrolled
  const topUnderBanner = announcementVisible ? 44 : 0
  const mobileLinks = navItems.filter((item) => item.to)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let alive = true
    fetchPublic('destinations')
      .then((rows) => {
        if (!alive) return
        setDestinationsList(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setDestinationsList([])
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
        setPackagesList(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setPackagesList([])
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    setOpen(false)
    setMegaOpen(false)
    setQuickMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (isHome) setScrolled(window.scrollY > 48)
  }, [isHome, location.pathname])

  useEffect(() => {
    let alive = true
    fetchCmsItems('navbar_mega')
      .then((rows) => {
        if (!alive) return
        setMegaCmsItems(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setMegaCmsItems([])
      })
    return () => {
      alive = false
    }
  }, [])

  const goSearch = () => {
    const el = document.getElementById('hero-search')
    if (el && isHome) {
      el.focus()
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    } else navigate('/destinations')
  }

  const cmsInternational = useMemo(() => buildMegaFromCms(megaCmsItems, 'international'), [megaCmsItems])
  const cmsDomestic = useMemo(() => buildMegaFromCms(megaCmsItems, 'domestic'), [megaCmsItems])
  const cmsThemes = useMemo(() => buildMegaFromCms(megaCmsItems, 'themes'), [megaCmsItems])
  const destinationInternational = useMemo(
    () => buildMegaFromDestinations(destinationsList, 'international'),
    [destinationsList]
  )
  const destinationDomestic = useMemo(
    () => buildMegaFromDestinations(destinationsList, 'domestic'),
    [destinationsList]
  )
  const megaConfig = useMemo(() => {
    if (megaType === 'domestic') {
      return cmsDomestic || destinationDomestic || domesticMega
    }
    if (megaType === 'themes') return cmsThemes || themeMega
    return cmsInternational || destinationInternational || internationalMega
  }, [
    megaType,
    cmsDomestic,
    cmsThemes,
    cmsInternational,
    destinationDomestic,
    destinationInternational,
  ])

  const openMega = (type) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    setMegaOpen(true)
    setMegaType(type)
    const cfg =
      type === 'domestic'
        ? cmsDomestic || destinationDomestic || domesticMega
        : type === 'themes'
          ? cmsThemes || themeMega
          : cmsInternational || destinationInternational || internationalMega
    setActiveRegion(cfg.regions[0]?.name ?? '')
  }

  const keepMegaOpen = () => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
  }

  const closeMegaWithDelay = (ms = 160) => {
    if (megaCloseTimer.current) clearTimeout(megaCloseTimer.current)
    megaCloseTimer.current = setTimeout(() => setMegaOpen(false), ms)
  }

  const openDestinationFromHeader = (name) => {
    const raw = String(name || '').trim()
    if (!raw) return
    const normalized = normalizeDestinationLabel(raw)
    const lower = normalized.toLowerCase()

    const matchedDestination = destinationsList.find((item) => {
      const title = String(item.name || '').toLowerCase()
      const country = String(item.country || '').toLowerCase()
      return title === lower || country === lower || title.includes(lower) || country.includes(lower)
    })
    if (matchedDestination) {
      const slug = String(matchedDestination.slug || matchedDestination.name || matchedDestination.id)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      navigate(`/destinations/${slug}`)
      return
    }

    const matchedPackage = packagesList.find((p) => {
      const loc = String(p.location || '').trim().toLowerCase()
      if (!loc) return false
      return loc === lower || loc.includes(lower) || slugFromLocationRaw(p.location) === slugFromLocationRaw(raw)
    })
    if (matchedPackage) {
      navigate(`/destinations/${slugFromLocationRaw(matchedPackage.location)}`)
      return
    }

    navigate(`/destinations?q=${encodeURIComponent(normalized)}`)
  }

  const megaRegions = megaConfig.regions ?? []
  const megaActive = megaRegions.find((r) => r.name === activeRegion) ?? megaRegions[0]
  const isDomesticMega = megaType === 'domestic'
  const domesticDestinations = megaRegions[0]?.destinations ?? []
  const megaDestinationList = megaActive?.destinations ?? []

  /* ——— Home hero: floating glass pill ——— */
  if (glassMode) {
    return (
      <header
        className="fixed left-0 right-0 z-[100]"
        style={{ top: topUnderBanner > 0 ? `${topUnderBanner}px` : '10px' }}
      >
        <div className="flex justify-center px-3 pt-3 sm:px-4 sm:pt-4">
            <motion.nav
              layout
              className="relative flex w-full max-w-5xl items-center justify-between gap-2 rounded-full border border-neutral-200 bg-white/95 px-3 py-2 shadow-lg sm:gap-3 sm:px-5 sm:py-2.5 lg:max-w-6xl"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link to="/" className="relative z-50 flex shrink-0 items-center gap-3">
              <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-honey shadow-md shadow-amber-500/40 ring-1 ring-amber-300 sm:h-12 sm:w-12">
                <img
                  src="/honeybee-bee.png"
                  alt="Honeybee Trips"
                  className="h-[130%] w-[130%] object-contain"
                  loading="eager"
                  fetchPriority="high"
                />
              </span>
              <span className="hidden leading-none sm:block">
                <span className="block font-display text-base font-semibold tracking-tight text-neutral-950">
                  Honeybee <span className="text-honey">trips</span>
                </span>
                <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-neutral-600">
                  be the bee…
                </span>
              </span>
            </Link>

            <div className="hidden flex-1 justify-center lg:flex">
              <div
                className="flex items-center gap-1 lg:gap-0.5 xl:gap-1"
                onMouseEnter={keepMegaOpen}
                onMouseLeave={() => closeMegaWithDelay()}
              >
                {navItems.map((item) => {
                  if (item.key === 'international' || item.key === 'domestic' || item.key === 'themes') {
                    const currentMega = item.key
                    return (
                      <NavLink
                        key={item.key}
                        to={item.to}
                        onMouseEnter={() => openMega(currentMega)}
                        onClick={(e) => {
                          if (!megaOpen || megaType !== currentMega) {
                            e.preventDefault()
                            openMega(currentMega)
                          }
                        }}
                        className={({ isActive }) =>
                          `flex items-center gap-0.5 rounded-full px-3 py-2 text-xs font-medium transition xl:text-sm ${
                            isActive
                              ? 'bg-honey text-neutral-950'
                              : 'text-neutral-800 hover:bg-honey/15 hover:text-neutral-950'
                          }`
                        }
                      >
                        {item.label}
                        {item.chevron && <ChevronDown className="h-3.5 w-3.5 opacity-70" aria-hidden />}
                      </NavLink>
                    )
                  }

                  return (
                    <NavLink
                      key={item.key}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-0.5 rounded-full px-3 py-2 text-xs font-medium transition xl:text-sm ${
                          isActive
                            ? 'bg-honey text-neutral-950'
                            : 'text-neutral-800 hover:bg-honey/15 hover:text-neutral-950'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  )
                })}

                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, x: '-50%' }}
                      animate={{ opacity: 1, y: 0, x: '-50%' }}
                      exit={{ opacity: 0, y: 10, x: '-50%' }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 top-full z-50 mt-0 w-[min(1280px,calc(100vw-24px))] rounded-3xl border border-neutral-200 bg-white px-6 py-5 text-left shadow-2xl shadow-black/20"
                      onMouseEnter={keepMegaOpen}
                      onMouseLeave={() => closeMegaWithDelay()}
                    >
                      {isDomesticMega ? (
                        <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-sm text-neutral-900">
                          {domesticDestinations.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => openDestinationFromHeader(d)}
                              className="cursor-pointer rounded-md px-1.5 py-1 text-left text-xs text-neutral-700 hover:bg-honey/15 hover:text-neutral-950"
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-12 gap-6">
                          <div className="col-span-3 space-y-2 border-r border-neutral-200 pr-4">
                            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-honey">
                              Regions
                            </p>
                            <ul className="space-y-1.5 text-xs text-neutral-600">
                              {megaRegions.map((region) => {
                                const active = region.name === activeRegion
                                return (
                                  <li key={region.name}>
                                    <button
                                      type="button"
                                      onMouseEnter={() => setActiveRegion(region.name)}
                                      onFocus={() => setActiveRegion(region.name)}
                                      className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition ${
                                        active
                                          ? 'bg-honey/15 text-neutral-950 border-l-2 border-honey'
                                          : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                                      }`}
                                    >
                                      <span>{region.name}</span>
                                    </button>
                                  </li>
                                )
                              })}
                            </ul>
                          </div>
                          <div className="col-span-9">
                            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-honey">
                              {megaActive?.name || 'Destinations'}
                            </p>
                            <div className="grid grid-cols-4 gap-x-8 gap-y-2 text-sm text-neutral-900">
                              {megaDestinationList.map((d) => (
                                <button
                                  key={d}
                                  type="button"
                                  onClick={() => openDestinationFromHeader(d)}
                                  className="cursor-pointer rounded-md px-1.5 py-1 text-left text-xs text-neutral-700 hover:bg-honey/15 hover:text-neutral-950"
                                >
                                  {d}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={goSearch}
                className="rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setQuickMenuOpen(true)}
                className="rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100"
                aria-label="Open quick menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link
                to="/contact"
                className="hidden rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100 sm:block"
                aria-label="Account"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                to="/contact"
                className="hidden rounded-full border border-honey/70 px-4 py-2 text-xs font-semibold text-honey transition hover:bg-honey hover:text-neutral-900 sm:inline-flex sm:text-sm"
              >
                Contact Us
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 text-white lg:hidden"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label={open ? 'Close menu' : 'Open menu'}
              >
                {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </motion.nav>
        </div>

        <AnimatePresence>
          {quickMenuOpen && (
            <>
              <motion.button
                type="button"
                aria-label="Close quick menu overlay"
                className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[1px]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setQuickMenuOpen(false)}
              />
              <motion.aside
                className="fixed right-0 top-0 z-[130] h-[100dvh] w-[min(88vw,360px)] border-l border-neutral-200 bg-white shadow-2xl"
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', stiffness: 280, damping: 30 }}
              >
                <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
                  <p className="font-display text-lg font-semibold text-neutral-900">Quick Menu</p>
                  <button
                    type="button"
                    onClick={() => setQuickMenuOpen(false)}
                    className="rounded-full p-2 text-neutral-700 transition hover:bg-neutral-100"
                    aria-label="Close quick menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="px-3 py-3">
                  <ul className="space-y-1">
                    {quickMenuItems.map((item) => (
                      <li key={item.key}>
                        <NavLink
                          to={item.to}
                          className={({ isActive }) =>
                            `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                              isActive
                                ? 'bg-honey/20 text-neutral-950'
                                : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950'
                            }`
                          }
                        >
                          {item.label}
                          <ChevronRight className="h-4 w-4 opacity-60" />
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {open && (
            <motion.div
              className="mx-3 mt-2 overflow-hidden rounded-2xl border border-white/15 bg-black/80 backdrop-blur-xl lg:hidden"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="flex flex-col gap-0.5 p-3">
                {mobileLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className="rounded-xl px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/10"
                  >
                    {l.label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    openBooking()
                    setOpen(false)
                  }}
                  className="mt-1 rounded-full bg-honey py-3 text-center text-sm font-semibold text-neutral-900"
                >
                  Book now
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    )
  }

  /* ——— Scrolled home + inner pages: solid bar ——— */
  const barTop = isHome && announcementVisible ? topUnderBanner : 0

  return (
    <header
      className="fixed left-0 right-0 z-[100] border-b border-honey/60 bg-[#171208]/95 text-white shadow-sm backdrop-blur-md"
      style={{ top: `${barTop}px` }}
    >
      <motion.nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="relative z-50 flex items-center gap-3">
          <span className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-honey shadow-md shadow-amber-500/40 ring-1 ring-amber-300 sm:h-12 sm:w-12">
            <img
              src="/honeybee-bee.png"
              alt="Honeybee Trips"
              className="h-[130%] w-[130%] object-contain"
              loading="eager"
              fetchPriority="high"
            />
          </span>
          <span className="hidden leading-none sm:block">
            <span className="block font-display text-base font-semibold tracking-tight text-white sm:text-lg">
              Honeybee <span className="text-honey">trips</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-medium tracking-wide text-white/55">
              be the bee…
            </span>
          </span>
        </Link>

        <div className="hidden flex-1 justify-center lg:flex">
          <div
            className="flex items-center gap-6"
            onMouseEnter={keepMegaOpen}
            onMouseLeave={() => closeMegaWithDelay()}
          >
            {navItems.map((item) => {
              if (item.key === 'international' || item.key === 'domestic' || item.key === 'themes') {
                const currentMega = item.key
                return (
                  <NavLink
                    key={item.key}
                    to={item.to}
                    onMouseEnter={() => openMega(currentMega)}
                    onClick={(e) => {
                      if (!megaOpen || megaType !== currentMega) {
                        e.preventDefault()
                        openMega(currentMega)
                      }
                    }}
                    className={({ isActive }) =>
                      `flex items-center gap-1 text-sm font-medium ${
                        isActive ? 'text-honey' : 'text-white/75 hover:text-honey'
                      }`
                    }
                  >
                    {item.label}
                    <ChevronDown className="h-4 w-4 opacity-70" aria-hidden />
                  </NavLink>
                )
              }

              return (
                <NavLink
                  key={item.key}
                  to={item.to}
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? 'text-honey' : 'text-white/75 hover:text-honey'}`
                  }
                >
                  {item.label}
                </NavLink>
              )
            })}

            <AnimatePresence>
              {megaOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, x: '-50%' }}
                  animate={{ opacity: 1, y: 0, x: '-50%' }}
                  exit={{ opacity: 0, y: 10, x: '-50%' }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-1/2 top-full z-40 mt-0 w-[min(1280px,calc(100vw-24px))] rounded-3xl border border-honey/40 bg-neutral-950 px-6 py-5 text-left shadow-2xl shadow-black/70"
                  onMouseEnter={keepMegaOpen}
                  onMouseLeave={() => closeMegaWithDelay()}
                >
                  {isDomesticMega ? (
                    <div className="grid grid-cols-4 gap-x-8 gap-y-4 text-sm text-white/90">
                      {domesticDestinations.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => openDestinationFromHeader(d)}
                          className="cursor-pointer rounded-md px-1.5 py-1 text-left text-xs text-white/80 hover:bg-white/5 hover:text-white"
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-12 gap-6">
                      <div className="col-span-3 space-y-2 border-r border-white/10 pr-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-honey">
                          Regions
                        </p>
                        <ul className="space-y-1.5 text-xs text-white/70">
                          {megaRegions.map((region) => {
                            const active = region.name === activeRegion
                            return (
                              <li key={region.name}>
                                <button
                                  type="button"
                                  onMouseEnter={() => setActiveRegion(region.name)}
                                  onFocus={() => setActiveRegion(region.name)}
                                  className={`flex w-full items-center justify-between rounded-md px-3 py-1.5 text-left transition ${
                                    active
                                      ? 'bg-white/10 text-white border-l-2 border-honey'
                                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span>{region.name}</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <div className="col-span-9">
                        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-honey">
                          {megaActive?.name || 'Destinations'}
                        </p>
                        <div className="grid grid-cols-4 gap-x-8 gap-y-2 text-sm text-white/90">
                          {megaDestinationList.map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => openDestinationFromHeader(d)}
                              className="cursor-pointer rounded-md px-1.5 py-1 text-left text-xs text-white/80 hover:bg-white/5 hover:text-white"
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            type="button"
            onClick={goSearch}
            className="rounded-full p-2 text-white/75 hover:bg-honey/15 hover:text-honey"
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setQuickMenuOpen(true)}
            className="rounded-full p-2 text-white/75 hover:bg-honey/15 hover:text-honey"
            aria-label="Open quick menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            to="/contact"
            className="rounded-full p-2 text-white/75 hover:bg-honey/15 hover:text-honey"
            aria-label="Contact"
          >
            <User className="h-5 w-5" />
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-1 rounded-full bg-honey px-5 py-2.5 text-sm font-medium text-neutral-900 transition hover:bg-honey-dark"
          >
            Contact Us
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-honey lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </motion.nav>

      <AnimatePresence>
        {quickMenuOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close quick menu overlay"
              className="fixed inset-0 z-[120] bg-black/40 backdrop-blur-[1px]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setQuickMenuOpen(false)}
            />
            <motion.aside
              className="fixed right-0 top-0 z-[130] h-[100dvh] w-[min(88vw,360px)] border-l border-white/15 bg-neutral-950 shadow-2xl"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            >
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <p className="font-display text-lg font-semibold text-white">Quick Menu</p>
                <button
                  type="button"
                  onClick={() => setQuickMenuOpen(false)}
                  className="rounded-full p-2 text-white/75 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close quick menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="px-3 py-3">
                <ul className="space-y-1">
                  {quickMenuItems.map((item) => (
                    <li key={item.key}>
                      <NavLink
                        to={item.to}
                        className={({ isActive }) =>
                          `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                            isActive
                              ? 'bg-honey text-neutral-900'
                              : 'text-white/80 hover:bg-white/10 hover:text-white'
                          }`
                        }
                      >
                        {item.label}
                        <ChevronRight className="h-4 w-4 opacity-60" />
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            className="border-t border-honey/30 bg-neutral-950 lg:hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.key}
                  to={item.to || '/'}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-3 text-base font-medium ${
                      isActive ? 'bg-honey text-neutral-900' : 'text-white/80'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  openBooking()
                  setOpen(false)
                }}
                className="mt-2 rounded-full bg-honey py-3 text-center text-sm font-semibold text-neutral-900"
              >
                Book now
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
