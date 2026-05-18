import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { SectionHeading } from '../components/SectionHeading'
import { DestinationCard } from '../components/DestinationCard'
import { useSeo } from '../hooks/useSeo'
import { fetchPublic } from '../api/adminPublic'
import { aggregateDestinationsFromPackages, parsePackageTripDays } from '../utils/packageLocationGroups'

const budgets = ['All', 'luxury', 'mid', 'budget']

function durationOptionToDays(option) {
  if (option === 'All') return null
  const m = String(option).match(/(\d+)/)
  return m ? Number(m[1]) : null
}

function matchesFilters(d, { locationFilter, budget, duration, search }) {
  if (locationFilter !== 'All') {
    if (locationFilter === 'International') {
      if (!d.hasInternational) return false
    } else if (locationFilter === 'Domestic') {
      if (!d.hasDomestic) return false
    } else if (String(d.displayLocation) !== String(locationFilter)) {
      return false
    }
  }

  if (budget !== 'All' && !d.budgetTiers.has(budget)) return false

  if (duration !== 'All') {
    const wantDays = durationOptionToDays(duration)
    if (wantDays != null) {
      if (!d.durationDayOptions.has(wantDays)) return false
    }
  }

  if (search) {
    const q = search.toLowerCase().trim()
    if (!q) return true
    const hayParts = [
      d.title,
      d.location,
      d.displayLocation,
      d.shortDescription,
      ...(d.packages?.map((p) => `${p.title || ''} ${p.short_desc || ''} ${p.location || ''}`) || []),
    ]
    const hay = hayParts.join(' ').toLowerCase()
    if (!hay.includes(q)) return false
  }

  return true
}

export function Destinations() {
  useSeo({
    title: 'Destinations',
    description: 'Browse HoneybeeTrips destinations — filter by region, budget, and duration.',
  })
  const [searchParams] = useSearchParams()
  const qParam = searchParams.get('q')?.trim() ?? ''

  const [locationFilter, setLocationFilter] = useState('All')
  const [budget, setBudget] = useState('All')
  const [duration, setDuration] = useState('All')
  const [packages, setPackages] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPublic('packages')
      .then((rows) => {
        if (!alive) return
        const list = Array.isArray(rows) ? rows : []
        setPackages(list)
      })
      .catch((err) => {
        console.warn('[Destinations] packages API error', err)
        if (!alive) return
        setPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  const sourceDestinations = useMemo(() => {
    if (!packages) return []
    return aggregateDestinationsFromPackages(packages)
  }, [packages])

  const locationOptions = useMemo(() => {
    const set = new Set(['All', 'International', 'Domestic'])
    sourceDestinations.forEach((d) => {
      const label = String(d.displayLocation || '').trim()
      if (label) set.add(label)
    })
    const rest = Array.from(set).filter((x) => !['All', 'International', 'Domestic'].includes(x))
    rest.sort((a, b) => a.localeCompare(b))
    return ['All', 'International', 'Domestic', ...rest]
  }, [sourceDestinations])

  const durationOptions = useMemo(() => {
    const days = new Set()
    ;(packages || []).forEach((p) => {
      const n = parsePackageTripDays(p.duration)
      if (n != null && n > 0) days.add(n)
    })
    const sorted = Array.from(days).sort((a, b) => a - b)
    if (sorted.length === 0) return ['All']
    return ['All', ...sorted.map((n) => `${n} days`)]
  }, [packages])

  useEffect(() => {
    if (duration !== 'All' && !durationOptions.includes(duration)) {
      setDuration('All')
    }
  }, [duration, durationOptions])

  useEffect(() => {
    if (locationFilter !== 'All' && !locationOptions.includes(locationFilter)) {
      setLocationFilter('All')
    }
  }, [locationFilter, locationOptions])

  const filtered = useMemo(() => {
    return sourceDestinations.filter((d) =>
      matchesFilters(d, { locationFilter, budget, duration, search: qParam })
    )
  }, [sourceDestinations, locationFilter, budget, duration, qParam])

  const visibleDestinations = filtered

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        titleId="destinations-title"
        eyebrow="Collection"
        title="Destinations"
        subtitle="Tap a card for full itineraries, inclusions, and pricing. Filters help you narrow the world."
      />

      <motion.div
        className="mb-10 flex flex-col gap-4 rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="min-w-[140px] flex-1">
          <label htmlFor="filter-region" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Location
          </label>
          <select
            id="filter-region"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
          >
            {locationOptions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px] flex-1">
          <label htmlFor="filter-budget" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Budget
          </label>
          <select
            id="filter-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm capitalize focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
          >
            {budgets.map((b) => (
              <option key={b} value={b}>
                {b === 'mid' ? 'Mid-range' : b}
              </option>
            ))}
          </select>
        </div>
        <div className="min-w-[140px] flex-1">
          <label htmlFor="filter-duration" className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Duration
          </label>
          <select
            id="filter-duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
          >
            {durationOptions.map((dur) => (
              <option key={dur} value={dur}>
                {dur}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {packages === null ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center text-neutral-600">
          Loading destinations…
        </p>
      ) : packages.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/80 px-6 py-14 text-center text-neutral-800">
          <p className="font-semibold text-neutral-900">No packages came back from the API</p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-700">
            This page builds destinations from <strong>active packages</strong> in the same database your <code className="rounded bg-white px-1 py-0.5 text-xs">public.php</code> call uses.
            Admin on Hostinger and the site on <strong>localhost</strong> are usually <strong>different databases</strong>: localhost defaults to{' '}
            <code className="rounded bg-white px-1 py-0.5 text-xs">/admin-api</code> → PHP on port 8000, not your live Hostinger MySQL.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-700">
            To see Azerbaijan (and other live packages) while developing: in <code className="rounded bg-white px-1 py-0.5 text-xs">frontend/.env</code> set{' '}
            <code className="rounded bg-white px-1 py-0.5 text-xs">VITE_ADMIN_PUBLIC_BASE=https://YOUR-ADMIN-HOST/.../api/public.php</code>, restart{' '}
            <code className="rounded bg-white px-1 py-0.5 text-xs">npm run dev</code>, and ensure CORS on the server allows your dev origin if needed.
          </p>
          <p className="mt-4 text-sm text-neutral-600">
            On the <strong>deployed</strong> frontend (same host or CORS-configured), packages from admin will show as soon as the build points at that API.
          </p>
        </div>
      ) : visibleDestinations.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center text-neutral-600">
          No destinations match those filters. Try setting Location to &quot;All&quot;, clear Budget/Duration, or widen your search
          {qParam ? ` (“${qParam}”)` : ''}.
        </p>
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDestinations.map((d, i) => (
            <DestinationCard key={d.id} destination={d} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
