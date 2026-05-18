const DEFAULT_BASE = '/admin-api'

const DEBUG = import.meta.env.DEV

function warnIfApiHostDiffersFromApp() {
  if (typeof window === 'undefined' || !DEBUG) return
  const raw = import.meta.env.VITE_ADMIN_PUBLIC_BASE?.trim()
  if (!raw || !/^https?:\/\//i.test(raw)) return
  try {
    const api = new URL(raw.split('?')[0])
    if (api.origin === window.location.origin) return
    console.warn(
      `[HoneyBee API] VITE_ADMIN_PUBLIC_BASE → ${api.origin} but the app runs on ${window.location.origin}. ` +
        'Package lists/itineraries/hotels come from THAT server, not from local php -S where you edit admin. ' +
        'For local CMS data: remove VITE_ADMIN_PUBLIC_BASE from frontend/.env (use Vite /admin-api proxy) or set it to http://127.0.0.1:8000/api/public.php',
    )
  } catch {
    /* ignore */
  }
}

warnIfApiHostDiffersFromApp()

function getBaseUrl() {
  return import.meta.env.VITE_ADMIN_PUBLIC_BASE?.trim() || DEFAULT_BASE
}

/** Origin + app path prefix for resolving `/uploads/...` from the PHP host (needed on localhost dev). */
export function getAdminMediaBase() {
  const b = import.meta.env.VITE_ADMIN_PUBLIC_BASE?.trim()
  if (!b || !/^https?:\/\//i.test(b)) return ''
  try {
    const clean = b.split('?')[0]
    const u = new URL(clean)
    const path = u.pathname.replace(/\/api\/public\.php$/i, '')
    return `${u.origin}${path.replace(/\/$/, '')}`
  } catch {
    return ''
  }
}

/** Turn admin-relative image paths into absolute URLs when the API is on another host. */
export function mediaUrl(path) {
  if (path == null || typeof path !== 'string') return ''
  const p = path.trim()
  if (!p) return ''
  if (/^https?:\/\//i.test(p)) return p
  const base = getAdminMediaBase()
  if (p.startsWith('/') && base) return `${base}${p}`
  return p
}

function cacheBust() {
  return { _t: String(Date.now()) }
}

/** Same rules as `normalizeSlug` in luxuryHelpers (URL segment ↔ CMS slug/title). */
function normalizePackageSlug(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function getJson(url) {
  const res = await fetch(url, { credentials: 'include' })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    if (DEBUG) {
      console.warn('[adminPublic]', res.status, url, text?.slice(0, 500))
    }
    throw new Error(`Request failed (${res.status}): ${text || url}`)
  }
  return res.json()
}

function buildUrl(params) {
  const base = getBaseUrl()
  const qs = new URLSearchParams(params)
  if (base.includes('?')) return `${base}&${qs.toString()}`
  return `${base}?${qs.toString()}`
}

export async function fetchPublic(resource) {
  const url = buildUrl({ resource, ...cacheBust() })
  const json = await getJson(url)
  return json?.data ?? []
}

export async function fetchPublicWithParams(resource, params = {}) {
  const url = buildUrl({ resource, ...params, ...cacheBust() })
  const json = await getJson(url)
  return json?.data ?? []
}

/** Filtered package list (maps to get_packages.php / public.php?resource=packages). */
export async function fetchPackages(filters = {}) {
  const flat = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue
    flat[k] = String(v)
  }
  return fetchPublicWithParams('packages', flat)
}

export async function fetchHotelsCatalog() {
  return fetchPublicWithParams('hotels_catalog', {})
}

export async function fetchSettingsMap() {
  const rows = await fetchPublic('settings')
  const map = {}
  for (const r of rows) {
    if (!r) continue
    map[String(r.key)] = r.value ?? ''
  }
  return map
}

export async function fetchDestinationPackages(destinationId) {
  const url = buildUrl({
    resource: 'destination_packages',
    destination_id: String(destinationId),
    ...cacheBust(),
  })
  const json = await getJson(url)
  return json?.data ?? []
}

export async function fetchPackageHotels(packageIds, packageSlug = '') {
  const ids = (Array.isArray(packageIds) ? packageIds : [packageIds])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0)
  const slug = normalizePackageSlug(packageSlug)
  const params = { resource: 'package_hotels', ...cacheBust() }
  if (ids.length) {
    params.package_ids = ids.join(',')
  } else if (slug) {
    params.package_slug = slug
  }
  if (!ids.length && !slug) return []
  const url = buildUrl(params)
  const json = await getJson(url)
  const rows = json?.data ?? []
  return Array.isArray(rows) ? rows.filter((row) => row && row.name != null) : []
}

function isItineraryRow(row) {
  if (!row || typeof row !== 'object') return false
  const day = row.day_number
  return day !== undefined && day !== null && String(day).trim() !== ''
}

export async function fetchPackageItineraries(packageIds, packageSlug = '') {
  const ids = (Array.isArray(packageIds) ? packageIds : [packageIds])
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0)
  const slug = normalizePackageSlug(packageSlug)
  const params = { resource: 'package_itineraries', ...cacheBust() }
  if (ids.length) {
    params.package_ids = ids.join(',')
  } else if (slug) {
    params.package_slug = slug
  }
  if (!ids.length && !slug) return []
  const url = buildUrl(params)
  const json = await getJson(url)
  const rows = json?.data ?? []
  if (!Array.isArray(rows)) return []
  const itineraryRows = rows.filter(isItineraryRow)
  if (DEBUG && rows.length > 0 && itineraryRows.length === 0) {
    console.warn(
      '[adminPublic] package_itineraries returned rows without day_number — check API URL/proxy (expected itinerary rows).',
    )
  }
  return itineraryRows
}

export async function fetchReviews() {
  const url = buildUrl({ resource: 'reviews', ...cacheBust() })
  const json = await getJson(url)
  return json?.data ?? []
}

export async function fetchBlogs() {
  const url = buildUrl({ resource: 'blogs', ...cacheBust() })
  const json = await getJson(url)
  return json?.data ?? []
}

export async function fetchCmsItems(section, scope = '') {
  const params = { resource: 'cms_items', ...cacheBust() }
  if (section) params.section = section
  if (scope) params.scope = scope
  const url = buildUrl(params)
  const json = await getJson(url)
  return json?.data ?? []
}

export async function fetchFeaturedPackages() {
  return fetchPublic('featured_packages')
}

export async function fetchRelatedPackages(packageId, limit = 6, packageSlug = '') {
  const id = Number(packageId)
  const slug = normalizePackageSlug(packageSlug)
  if (!(Number.isFinite(id) && id > 0) && !slug) return []
  const flat = { limit: String(limit), ...cacheBust() }
  if (Number.isFinite(id) && id > 0) {
    flat.package_id = String(id)
  } else if (slug) {
    flat.package_slug = slug
  }
  return fetchPublicWithParams('related_packages', flat)
}

/** Gallery image paths for a package (ordered). */
export async function fetchPackageGallery(packageId, packageSlug = '') {
  const id = Number(packageId)
  const slug = normalizePackageSlug(packageSlug)
  const flat = { ...cacheBust() }
  if (Number.isFinite(id) && id > 0) {
    flat.package_id = String(id)
  } else if (slug) {
    flat.package_slug = slug
  }
  if (!(Number.isFinite(id) && id > 0) && !slug) return []
  const rows = await fetchPublicWithParams('package_gallery', flat)
  return Array.isArray(rows) ? rows : []
}
