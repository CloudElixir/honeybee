import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MapPin, Clock, ArrowRight } from 'lucide-react'
import {
  fetchDestinationPackages,
  fetchPackageHotels,
  fetchPublic,
  fetchRelatedPackages,
  mediaUrl,
} from '../api/adminPublic'
import { useSeo } from '../hooks/useSeo'
import { getDestinationBySlug } from '../data/destinations'
import { DestinationDetailPage } from './DestinationDetail'
import {
  aggregateDestinationsFromPackages,
  filterPackagesByLocationSlug,
  normalizeSlug,
  slugFromLocationRaw,
} from '../utils/packageLocationGroups'

export function DestinationDetailDynamic() {
  const { id } = useParams()
  const heritageDestination = useMemo(() => {
    const d = getDestinationBySlug(normalizeSlug(id))
    if (d && !d.isVirtual) return d
    return null
  }, [id])

  if (heritageDestination) {
    return <DestinationDetailPage destinationSlug={heritageDestination.id} />
  }

  const [destination, setDestination] = useState(null)
  const [packages, setPackages] = useState([])
  const [allPackages, setAllPackages] = useState([])
  const [hotelsByPackage, setHotelsByPackage] = useState({})
  const [allDestinations, setAllDestinations] = useState([])
  const [youMightAlsoLike, setYouMightAlsoLike] = useState([])
  const [fromPackagesOnly, setFromPackagesOnly] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [rows, pkgRows] = await Promise.all([fetchPublic('destinations'), fetchPublic('packages')])
        if (!alive) return

        const slug = normalizeSlug(id)
        const destList = Array.isArray(rows) ? rows : []
        const allPkgs = Array.isArray(pkgRows) ? pkgRows : []
        setAllPackages(allPkgs)

        const found = destList.find((d) => normalizeSlug(d.slug || d.name || d.id) === slug)

        if (found) {
          setFromPackagesOnly(false)
          setDestination(found)
          setAllDestinations(destList)
          if (found?.id) {
            const linked = await fetchDestinationPackages(found.id)
            if (!alive) return
            const linkedRows = Array.isArray(linked) ? linked : []
            setPackages(linkedRows)
            const hotelRows = await fetchPackageHotels(linkedRows.map((p) => p.id))
            if (!alive) return
            const grouped = {}
            for (const h of hotelRows) {
              const key = String(h.package_id)
              if (!grouped[key]) grouped[key] = []
              grouped[key].push(h)
            }
            setHotelsByPackage(grouped)
            if (linkedRows[0]?.id) {
              const related = await fetchRelatedPackages(linkedRows[0].id, 6)
              if (!alive) return
              setYouMightAlsoLike(Array.isArray(related) ? related : [])
            } else {
              setYouMightAlsoLike([])
            }
          } else {
            setPackages([])
            setHotelsByPackage({})
            setYouMightAlsoLike([])
          }
          return
        }

        const byLocation = filterPackagesByLocationSlug(allPkgs, slug)
        if (byLocation.length > 0) {
          const agg = aggregateDestinationsFromPackages(allPkgs)
          const card = agg.find((c) => c.slug === slug) || agg.find((c) => slugFromLocationRaw(c.displayLocation) === slug)
          const displayName = card?.displayLocation || byLocation[0]?.location || 'Destination'
          const synthetic = {
            id: null,
            name: card?.title || displayName.split(',')[0].trim() || displayName,
            country: displayName,
            description:
              card?.shortDescription ||
              `Curated packages in ${displayName}. Browse live itineraries and request a tailored plan.`,
            cover_image: card?.image,
            image_paths: card?.image ? [card.image] : [],
            slug,
          }
          setFromPackagesOnly(true)
          setDestination(synthetic)
          setPackages(byLocation)
          setAllDestinations(destList)
          setYouMightAlsoLike([])
          const hotelRows = await fetchPackageHotels(byLocation.map((p) => p.id))
          if (!alive) return
          const grouped = {}
          for (const h of hotelRows) {
            const key = String(h.package_id)
            if (!grouped[key]) grouped[key] = []
            grouped[key].push(h)
          }
          setHotelsByPackage(grouped)
          if (byLocation[0]?.id) {
            const related = await fetchRelatedPackages(byLocation[0].id, 6)
            if (!alive) return
            setYouMightAlsoLike(Array.isArray(related) ? related : [])
          }
          return
        }

        setDestination(null)
        setPackages([])
        setHotelsByPackage({})
        setYouMightAlsoLike([])
        setFromPackagesOnly(false)
        setAllDestinations(destList)
      } catch (e) {
        console.warn('[DestinationDetail] load error', e)
        if (!alive) return
        setDestination(null)
        setPackages([])
        setHotelsByPackage({})
        setYouMightAlsoLike([])
      }
    })()
    return () => {
      alive = false
    }
  }, [id])

  const pageTitle = destination?.name ? `${destination.name} Packages` : 'Destination'
  useSeo({
    title: pageTitle,
    description:
      destination?.description ||
      'Explore destination-specific itineraries and curated packages from HoneyBeeTrips.',
  })

  const heroImage =
    (Array.isArray(destination?.image_paths) && destination.image_paths[0]) ||
    destination?.cover_image ||
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80'

  const packageList = useMemo(() => packages.slice(0, 12), [packages])

  const packageDerivedLinks = useMemo(() => {
    const slugParam = normalizeSlug(id)
    return aggregateDestinationsFromPackages(allPackages).filter((c) => c.slug !== slugParam)
  }, [allPackages, id])

  if (!destination) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-20 text-center">
        <p className="text-sm uppercase tracking-[0.18em] text-neutral-500">Destination</p>
        <h1 className="mt-2 text-3xl font-semibold text-neutral-900">Not found</h1>
        <p className="mt-3 text-neutral-600">This destination is not available in admin yet.</p>
        <Link to="/destinations" className="mt-6 inline-flex rounded-full bg-honey px-6 py-3 font-semibold text-neutral-900">
          Back to destinations
        </Link>
      </div>
    )
  }

  return (
    <section>
      <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
        <img src={heroImage} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
          <p className="text-xs uppercase tracking-[0.2em] text-honey">Destination</p>
          <h1 className="mt-2 text-4xl font-bold text-white sm:text-5xl">{destination.name}</h1>
          <p className="mt-3 flex items-center gap-2 text-sm text-white/85">
            <MapPin className="h-4 w-4" /> {destination.country || 'Curated route'}
          </p>
          {fromPackagesOnly && (
            <p className="mt-2 max-w-2xl text-xs text-white/75">
              Live packages grouped by location from your catalog{allDestinations.length ? '' : ' (no separate destination rows required).'}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-2xl font-semibold text-neutral-900">Overview</h2>
          <p className="mt-3 text-neutral-700">
            {destination.description || `Explore curated routes in ${destination.name} with private planning support.`}
          </p>
        </div>

        <div className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-neutral-900">Packages in this destination</h2>
            <span className="text-sm text-neutral-500">{packageList.length} found</span>
          </div>

          {packageList.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center text-neutral-600">
              No linked packages yet. Add package links in admin destinations.
            </p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packageList.map((p) => {
                const pkgSlug = normalizeSlug(p.slug || p.title || p.id)
                const detailHref = `/packages/${pkgSlug}`
                const priceInr = Number(p.price || 0)
                const priceLabel =
                  priceInr > 0
                    ? new Intl.NumberFormat('en-IN', {
                        style: 'currency',
                        currency: 'INR',
                        maximumFractionDigits: 0,
                      }).format(priceInr)
                    : '—'
                return (
                  <Link
                    key={p.id}
                    to={detailHref}
                    className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-honey hover:shadow-md"
                  >
                    <div className="relative aspect-[4/3]">
                      <img
                        src={
                          mediaUrl(p.image_path) ||
                          mediaUrl(p.cover_image) ||
                          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
                        }
                        alt=""
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
                      />
                      <span className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-semibold text-white">
                        {p.category || 'Package'}
                      </span>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-neutral-900 group-hover:text-amber-700">{p.title}</h3>
                      <div className="mt-2 flex items-center gap-3 text-sm text-neutral-600">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {p.duration || 'Custom'}
                        </span>
                        <span className="font-semibold text-neutral-900">{priceLabel}</span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-sm text-neutral-600">
                        {p.short_desc || 'Tailored itinerary details available on request.'}
                      </p>
                      {(hotelsByPackage[String(p.id)]?.length ?? 0) > 0 && (
                        <div className="mt-3 rounded-xl bg-neutral-50 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-neutral-500">Hotels</p>
                          <ul className="mt-2 space-y-1">
                            {hotelsByPackage[String(p.id)].slice(0, 2).map((h) => (
                              <li key={h.id} className="text-sm text-neutral-700">
                                {h.name} <span className="text-neutral-500">- {h.location}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-honey px-4 py-2 text-sm font-semibold text-neutral-900">
                        View package <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {youMightAlsoLike.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-neutral-900">You Might Also Like</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {youMightAlsoLike.map((p) => (
                <Link
                  key={`also-${p.id}`}
                  to={`/packages/${normalizeSlug(p.slug || p.title || p.id)}`}
                  className="rounded-xl border border-neutral-200 bg-white p-4 hover:border-honey"
                >
                  <p className="font-semibold text-neutral-900">{p.title}</p>
                  <p className="mt-1 text-sm text-neutral-600">{p.location}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {(allDestinations.length > 0 || packageDerivedLinks.length > 0) && (
          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-neutral-900">All Destinations</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {allDestinations.map((d) => (
                <Link
                  key={`dest-${d.id}`}
                  to={`/destinations/${normalizeSlug(d.slug || d.name || d.id)}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-honey"
                >
                  {d.name}
                </Link>
              ))}
              {packageDerivedLinks.map((c) => (
                <Link
                  key={`pkg-loc-${c.slug}`}
                  to={`/destinations/${c.slug}`}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:border-honey"
                >
                  {c.displayLocation}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
