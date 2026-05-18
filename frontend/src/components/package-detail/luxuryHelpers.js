/** Framer-motion reveal — visible by default (avoids stuck opacity:0 with whileInView). */
export const luxuryReveal = {
  initial: false,
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.06 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
}

/** @param {unknown} value */
export function normalizeSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Pick the CMS package for `/packages/:id` the same way users expect:
 * numeric segment → id match; else prefer explicit `slug` field over title-only collisions.
 */
/** Keep rows from package-scoped API calls when `package_id` is missing on the row. */
export function rowBelongsToPackage(row, packageId) {
  const pid = Number(packageId)
  if (!Number.isFinite(pid) || pid <= 0) return true
  const rowPid = Number(row?.package_id ?? row?.PACKAGE_ID)
  if (!Number.isFinite(rowPid) || rowPid <= 0) return true
  return rowPid === pid
}

/** Bali Romantic Escape — URL slug or CMS title match. */
export function isBaliRomanticEscapePackage(pkg, routeParam = '') {
  const slug = normalizeSlug(routeParam || pkg?.slug || pkg?.title || '')
  if (slug === 'bali-romantic-escape') return true
  return /bali\s*romantic\s*escape/i.test(String(pkg?.title || ''))
}

export function findPackageByRouteParam(packages, routeParam) {
  const list = Array.isArray(packages) ? packages : []
  const raw = String(routeParam ?? '').trim()
  if (!raw) return null
  if (/^\d+$/.test(raw)) {
    const byId = list.find((p) => String(p.id) === raw)
    if (byId) return byId
  }
  const slugWant = normalizeSlug(raw)
  const bySlugField = list.find((p) => {
    const s = String(p.slug || '').trim()
    return s !== '' && normalizeSlug(s) === slugWant
  })
  if (bySlugField) return bySlugField
  return list.find((p) => normalizeSlug(p.slug || p.title || p.id) === slugWant) ?? null
}

export function splitListField(value) {
  return String(value || '')
    .split(/\r?\n|,/)
    .map((v) => v.trim())
    .filter(Boolean)
}

export function formatInr(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return '—'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

/** Parse CMS duration strings like `6D/5N`, `4N / 5D`, `7 days`. */
export function parseDurationParts(duration) {
  const s = String(duration || '').trim()
  if (!s) return { nights: null, days: null }
  const nights = s.match(/(\d+)\s*N/i)?.[1] ?? null
  const days = s.match(/(\d+)\s*D/i)?.[1] ?? null
  if (!nights && !days) {
    const only = s.match(/(\d+)/)?.[1]
    return { nights: null, days: only }
  }
  return { nights, days }
}

/** @param {Record<string, unknown>} pkg @param {3|4|5} stars */
export function tierPriceForStar(pkg, stars) {
  const key =
    stars === 3 ? 'tier_price_3_star' : stars === 4 ? 'tier_price_4_star' : 'tier_price_5_star'
  const n = Number(pkg?.[key])
  if (Number.isFinite(n) && n > 0) return n
  const base = Number(pkg?.price)
  return Number.isFinite(base) && base > 0 ? base : 0
}

/** Resolve 3-star / 4-star / 5-star from CMS row (hotel_type, notes, or star_rating). */
export function hotelTierKey(hotel) {
  const type = String(hotel?.hotel_type || '').toLowerCase().trim()
  if (type === '3-star' || type === '4-star' || type === '5-star') return type
  const notes = String(hotel?.notes || '').toLowerCase().trim()
  if (notes === '3-star' || notes === '4-star' || notes === '5-star') return notes
  const m = notes.match(/\b([345])\s*[- ]?\s*star\b/i)
  if (m) return `${m[1]}-star`
  const stars = Number(hotel?.star_rating)
  if (stars === 3 || stars === 4 || stars === 5) return `${stars}-star`
  return ''
}

/** @param {unknown[]} hotels @param {3|4|5} tier */
export function hotelsForTier(hotels, tier) {
  const want = `${tier}-star`
  return (Array.isArray(hotels) ? hotels : []).filter((h) => hotelTierKey(h) === want)
}

/**
 * Parse itinerary day description into activity rows.
 * Admin format (one per line): `Label: detail text` or plain sentence.
 */
export function parseDayActivities(description) {
  const raw = String(description ?? '').trim()
  if (!raw) return { kind: 'empty', items: [] }
  if (raw.includes('<') && /<[a-z][\s\S]*>/i.test(raw)) {
    return { kind: 'html', html: raw }
  }
  const items = raw
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-–•*]+/, '').trim())
    .filter(Boolean)
    .map((line) => {
      const labeled = line.match(/^([^:]+):\s*(.+)$/)
      if (labeled) {
        return { label: labeled[1].trim(), text: labeled[2].trim() }
      }
      return { label: '', text: line }
    })
  return { kind: 'activities', items }
}

export function parseNotes(importantNotes) {
  return String(importantNotes || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

export function parseCancellationRules(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
}

export function parseFaqBlocks(faq) {
  const s = String(faq || '').trim()
  if (!s) return []
  const blocks = []
  const chunks = s.split(/\r?\n\r?\n/)
  for (const chunk of chunks) {
    const t = chunk.trim()
    if (!t) continue
    const m = t.match(/^Q:\s*(.+?)\s*\nA:\s*(.+)$/is)
    if (m) {
      blocks.push({ q: m[1].trim(), a: m[2].trim() })
      continue
    }
    if (t.includes('|')) {
      const [q, a] = t.split('|').map((x) => x.trim())
      if (q && a) blocks.push({ q, a })
    }
  }
  return blocks
}

export function parseTermsBlocks(terms) {
  const s = String(terms || '').trim()
  if (!s) return []
  const parts = s.split(/\r?\n\r?\n+/)
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split(/\r?\n/).map((l) => l.trim())
      const first = lines[0] || ''
      if (first.endsWith(':') && lines.length > 1) {
        return { title: first.replace(/:$/, ''), body: lines.slice(1).join('\n') }
      }
      return { title: 'Policy', body: block }
    })
}

/** @param {Record<string, string>|null|undefined} settings */
export function whatsappHrefFromSettings(settings, message) {
  const raw =
    (settings && String(settings.whatsapp_number || '').trim()) ||
    (settings && String(settings.site_phone || '').trim()) ||
    ''
  const digits = raw.replace(/\D/g, '')
  if (digits.length < 8) {
    return `https://wa.me/?text=${encodeURIComponent(message)}`
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function wishlistStorageKey() {
  return 'hb-package-wishlist'
}

export function readWishlistSet() {
  try {
    const raw = localStorage.getItem(wishlistStorageKey())
    const arr = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(arr) ? arr.map(Number).filter((n) => n > 0) : [])
  } catch {
    return new Set()
  }
}

export function writeWishlistSet(set) {
  localStorage.setItem(wishlistStorageKey(), JSON.stringify([...set]))
}
