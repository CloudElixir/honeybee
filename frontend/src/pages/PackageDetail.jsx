import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchPackageGallery,
  fetchPackageHotels,
  fetchPackageItineraries,
  fetchPackages,
  fetchRelatedPackages,
  fetchReviews,
} from '../api/adminPublic'
import { LuxuryPackageDetailView } from '../components/package-detail/LuxuryPackageDetailView'
import {
  findPackageByRouteParam,
  isBaliRomanticEscapePackage,
  rowBelongsToPackage,
} from '../components/package-detail/luxuryHelpers'
import { baliRomanticEscapeFallbackItinerary } from '../data/baliRomanticEscapeItinerary'
import { useBooking } from '../context/BookingContext'
import { useAdminSettings } from '../hooks/useAdminSettings'
import { useSeo } from '../hooks/useSeo'

function ensureItineraryRowIds(rows) {
  return (Array.isArray(rows) ? rows : []).map((row, idx) => {
    const raw = row?.id ?? row?.ID ?? row?.itinerary_id
    const n = Number(raw)
    if (Number.isFinite(n) && n > 0) {
      return { ...row, id: n }
    }
    const dn = Number(row?.day_number) || 0
    const so = Number(row?.sort_order) || 0
    return { ...row, id: `it-${idx}-${dn}-${so}` }
  })
}

export function PackageDetail() {
  const { id } = useParams()
  const { openBooking } = useBooking()
  const { settings } = useAdminSettings()

  const [loading, setLoading] = useState(true)
  const [pkg, setPkg] = useState(null)
  const [itinerary, setItinerary] = useState([])
  const [hotels, setHotels] = useState([])
  const [relatedPackages, setRelatedPackages] = useState([])
  const [galleryPaths, setGalleryPaths] = useState([])
  const [reviews, setReviews] = useState([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setItinerary([])
      setHotels([])
      setRelatedPackages([])
      setGalleryPaths([])
      try {
        const packages = await fetchPackages({})
        const found = findPackageByRouteParam(packages || [], id)
        if (!alive) return
        setPkg(found || null)
        if (found?.id) {
          const packageId = Number(found.id)
          const routeSlug = String(found.slug || id || found.title || '').trim()
          const settled = await Promise.allSettled([
            fetchPackageItineraries(packageId, routeSlug),
            fetchPackageHotels(packageId, routeSlug),
            fetchRelatedPackages(packageId, 8),
            fetchPackageGallery(packageId),
            fetchReviews(),
          ])
          if (!alive) return
          const pid = packageId
          const its = settled[0].status === 'fulfilled' ? settled[0].value : []
          const hs = settled[1].status === 'fulfilled' ? settled[1].value : []
          const related = settled[2].status === 'fulfilled' ? settled[2].value : []
          const gallery = settled[3].status === 'fulfilled' ? settled[3].value : []
          const reviewRows = settled[4].status === 'fulfilled' ? settled[4].value : []
          if (import.meta.env.DEV) {
            settled.forEach((result, idx) => {
              if (result.status === 'rejected') {
                const labels = ['itineraries', 'hotels', 'related', 'gallery', 'reviews']
                console.warn(`[PackageDetail] ${labels[idx]} fetch failed:`, result.reason)
              }
            })
          }
          let itsRows = Array.isArray(its) ? its : []
          let hsRows = Array.isArray(hs) ? hs : []
          if (itsRows.length === 0 && routeSlug) {
            try {
              itsRows = await fetchPackageItineraries([], routeSlug)
            } catch {
              /* slug fallback optional */
            }
          }
          if (hsRows.length === 0 && routeSlug) {
            try {
              hsRows = await fetchPackageHotels([], routeSlug)
            } catch {
              /* slug fallback optional */
            }
          }
          let scopedItinerary = itsRows.filter((row) => rowBelongsToPackage(row, pid))
          const scopedHotels = hsRows.filter((row) => rowBelongsToPackage(row, pid))
          if (
            scopedItinerary.length === 0 &&
            isBaliRomanticEscapePackage(found, id)
          ) {
            scopedItinerary = baliRomanticEscapeFallbackItinerary(pid)
          }
          if (import.meta.env.DEV) {
            if (itsRows.length > 0 && scopedItinerary.length === 0) {
              console.warn(
                `[PackageDetail] ${itsRows.length} itinerary row(s) from API but none matched package id=${pid}`,
              )
            }
            if (hsRows.length > 0 && scopedHotels.length === 0) {
              console.warn(
                `[PackageDetail] ${hsRows.length} hotel row(s) from API but none matched package id=${pid}`,
              )
            }
          }
          setItinerary(ensureItineraryRowIds(scopedItinerary))
          setHotels(scopedHotels)
          setRelatedPackages(Array.isArray(related) ? related : [])
          setGalleryPaths(Array.isArray(gallery) ? gallery : [])
          setReviews(Array.isArray(reviewRows) ? reviewRows : [])
          if (import.meta.env.DEV) {
            const remoteBase = import.meta.env.VITE_ADMIN_PUBLIC_BASE?.trim()
            const noChild =
              (!Array.isArray(its) || its.length === 0) && (!Array.isArray(hs) || hs.length === 0)
            if (
              noChild &&
              remoteBase &&
              /^https?:\/\//i.test(remoteBase) &&
              typeof window !== 'undefined'
            ) {
              try {
                if (new URL(remoteBase.split('?')[0]).origin !== window.location.origin) {
                  console.warn(
                    `[PackageDetail] Package "${found.title}" (id=${packageId}) has no itinerary/hotel rows from the API. ` +
                      'You are using a remote VITE_ADMIN_PUBLIC_BASE; local admin changes will not show until that server has the same data, or you use the local API.',
                  )
                }
              } catch {
                /* ignore */
              }
            }
          }
        } else {
          setItinerary([])
          setHotels([])
          setRelatedPackages([])
          setGalleryPaths([])
          setReviews([])
        }
      } catch (e) {
        if (import.meta.env.DEV) console.warn('[PackageDetail]', e)
        if (!alive) return
        setPkg(null)
        setItinerary([])
        setHotels([])
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  useSeo({
    title: pkg?.title ? `${pkg.title} | HoneyBee Trips` : 'Package',
    description:
      pkg?.short_desc ||
      pkg?.meta_description ||
      'Luxury package details, itinerary, stays, and booking — powered by your CMS.',
  })

  if (loading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[#f5f5f4] text-neutral-800">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-lux-gold border-t-transparent" aria-hidden />
        <p className="mt-4 text-sm text-neutral-500">Loading your journey…</p>
      </div>
    )
  }

  if (!pkg) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-neutral-800">
        <h1 className="text-3xl font-semibold text-neutral-900">Package not found</h1>
        <p className="mt-2 text-neutral-600">This package is not in your CMS or the link is outdated.</p>
        <Link
          to="/packages"
          className="mt-6 inline-flex rounded-full bg-lux-gold px-6 py-3 font-semibold text-lux-black"
        >
          Back to packages
        </Link>
      </div>
    )
  }

  return (
    <LuxuryPackageDetailView
      pkg={pkg}
      itinerary={itinerary}
      hotels={hotels}
      relatedPackages={relatedPackages}
      galleryPaths={galleryPaths}
      reviews={reviews}
      settings={settings || {}}
      openBooking={openBooking}
    />
  )
}
