/**
 * Group active packages by normalized location for destinations UI and nav fallbacks.
 */

export function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Canonical key for grouping / matching location strings from the DB */
export function normalizeLocationKey(raw) {
  return String(raw || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[,/|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function slugFromLocationRaw(raw) {
  return normalizeSlug(normalizeLocationKey(raw))
}

/** First integer before "D" (days), else first "N days" pattern */
export function parsePackageTripDays(duration) {
  const s = String(duration || '')
  const dMatch = s.match(/(\d+)\s*D\b/i)
  if (dMatch) return Number(dMatch[1])
  const dayWord = s.match(/(\d+)\s*days?\b/i)
  if (dayWord) return Number(dayWord[1])
  return null
}

export function inferBudgetTier(price, tertiles = null) {
  const n = Number(price)
  if (!Number.isFinite(n) || n <= 0) return 'mid'
  if (tertiles && typeof tertiles.low === 'number' && typeof tertiles.high === 'number') {
    if (n >= tertiles.high) return 'luxury'
    if (n < tertiles.low) return 'budget'
    return 'mid'
  }
  if (n >= 75000) return 'luxury'
  if (n < 28000) return 'budget'
  return 'mid'
}

function computePriceTertiles(prices) {
  const sorted = [...prices].filter((x) => Number.isFinite(x) && x > 0).sort((a, b) => a - b)
  if (sorted.length < 3) return null
  const q = (p) => sorted[Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)))]
  return { low: q(0.33), high: q(0.66) }
}

function pickDisplayLabel(candidates) {
  const list = Array.from(candidates).map((s) => String(s || '').trim()).filter(Boolean)
  if (list.length === 0) return 'Destination'
  return list.reduce((a, b) => (a.length >= b.length ? a : b))
}

function titleFromDisplay(display) {
  const d = String(display || '').trim()
  if (!d) return 'Destination'
  const comma = d.split(',')[0].trim()
  return comma || d
}

/**
 * @param {Array<object>} packages — rows from `resource=packages` (already active)
 * @returns {Array<object>} destination-shaped cards for the listing page
 */
export function aggregateDestinationsFromPackages(packages) {
  const rows = Array.isArray(packages) ? packages : []
  const allPrices = rows.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0)
  const tertiles = computePriceTertiles(allPrices)

  const byKey = new Map()

  for (const p of rows) {
    const rawLoc = String(p.location || '').trim()
    if (!rawLoc) continue
    const key = normalizeLocationKey(rawLoc)
    if (!key) continue
    if (!byKey.has(key)) {
      byKey.set(key, {
        key,
        displayCandidates: new Set(),
        packages: [],
      })
    }
    const g = byKey.get(key)
    g.displayCandidates.add(rawLoc)
    g.packages.push(p)
  }

  return Array.from(byKey.values()).map((g) => {
    const displayLocation = pickDisplayLabel(g.displayCandidates)
    const title = titleFromDisplay(displayLocation)
    const prices = g.packages.map((p) => Number(p.price)).filter((n) => Number.isFinite(n) && n > 0)
    const priceFrom = prices.length ? Math.min(...prices) : 0

    const budgetTiers = new Set()
    const durationDayOptions = new Set()
    const durations = new Set()
    let hasInternational = false
    let hasDomestic = false

    for (const p of g.packages) {
      budgetTiers.add(inferBudgetTier(p.price, tertiles))
      const days = parsePackageTripDays(p.duration)
      if (days != null) durationDayOptions.add(days)
      const dur = String(p.duration || '').trim()
      if (dur) durations.add(dur)
      const cat = String(p.category || '').toLowerCase()
      if (cat.includes('domestic')) hasDomestic = true
      else hasInternational = true
    }

    const slug = slugFromLocationRaw(displayLocation)
    const firstImg = g.packages.map((p) => p.image_path).find(Boolean)
    const fallbackImg = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
    const shortBits = g.packages.map((p) => String(p.short_desc || '').trim()).filter(Boolean)

    let durationLabel = 'Custom'
    if (durations.size === 1) durationLabel = Array.from(durations)[0]
    else if (durations.size > 1) durationLabel = 'Multiple durations'

    return {
      id: slug,
      slug,
      title,
      location: displayLocation,
      region: hasDomestic && !hasInternational ? 'Domestic' : 'International',
      priceFrom,
      duration: durationLabel,
      budgetTiers,
      durationDayOptions,
      hasInternational,
      hasDomestic,
      displayLocation,
      packages: g.packages,
      image: firstImg || fallbackImg,
      banner: firstImg || fallbackImg,
      shortDescription:
        shortBits[0] ||
        `Explore ${title} with curated packages and HoneyBeeTrips planning support.`,
      highlights: [],
      itinerary: [],
      included: [],
    }
  })
}

export function filterPackagesByLocationSlug(packages, slugParam) {
  const want = normalizeSlug(slugParam)
  if (!want) return []
  return (Array.isArray(packages) ? packages : []).filter((p) => slugFromLocationRaw(p.location) === want)
}
