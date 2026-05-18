import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCmsItems, fetchPublic, mediaUrl } from '../api/adminPublic'
import { normalizeSlug } from './package-detail/luxuryHelpers'

const bookingFilters = [
  { id: 'all', label: 'All Destinations' },
  { id: 'honeymoon', label: 'Honeymoon' },
  { id: 'family', label: 'Family' },
  { id: 'under150k', label: 'INR 1.5L or less' },
  { id: 'luxury', label: 'Luxury' },
]

const formatInr = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)

const travelerNames = [
  'Aarav from Mumbai',
  'Priya from Chennai',
  'Rahul from Bengaluru',
  'Nisha from Hyderabad',
  'Karan from Delhi',
  'Sneha from Pune',
  'Vikram from Ahmedabad',
  'Meera from Kochi',
]

const fallbackPackages = [
  {
    id: 'fallback-bali',
    tag: 'honeymoon',
    traveler: 'Riya from Mumbai',
    bookedAgo: '1 hr ago',
    title: 'Couple Retreat: 6 Nights in Bali',
    details: 'Bali, Ubud (6N/7D)',
    destinations: ['Bali', 'Ubud'],
    image:
      'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=1200&q=80',
    priceInr: 64545,
  },
  {
    id: 'fallback-thailand',
    tag: 'under150k',
    traveler: 'Nipun from Delhi',
    bookedAgo: '2 hr ago',
    title: 'Island Escape: Phuket + Krabi',
    details: 'Thailand (5N/6D)',
    destinations: ['Phuket', 'Krabi'],
    image:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
    priceInr: 36609,
  },
  {
    id: 'fallback-paris',
    tag: 'luxury',
    traveler: 'Shivam from Bengaluru',
    bookedAgo: '3 hr ago',
    title: 'Europe Highlights: Paris + Montreux',
    details: 'France, Switzerland (8N/9D)',
    destinations: ['Paris', 'Montreux'],
    image:
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80',
    priceInr: 301199,
  },
  {
    id: 'fallback-dubai',
    tag: 'family',
    traveler: 'Megha from Pune',
    bookedAgo: '4 hr ago',
    title: 'Dubai Family Week: City + Desert',
    details: 'Dubai, UAE (5N/6D)',
    destinations: ['Dubai'],
    image:
      'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80',
    priceInr: 118900,
  },
  {
    id: 'fallback-singapore',
    tag: 'under150k',
    traveler: 'Aditya from Noida',
    bookedAgo: '5 hr ago',
    title: 'Singapore Essentials + Sentosa',
    details: 'Singapore (4N/5D)',
    destinations: ['Singapore'],
    image:
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&q=80',
    priceInr: 89900,
  },
  {
    id: 'fallback-kerala',
    tag: 'family',
    traveler: 'Anita from Kochi',
    bookedAgo: '6 hr ago',
    title: 'Kerala Backwaters and Hills',
    details: 'Munnar, Alleppey (5N/6D)',
    destinations: ['Munnar', 'Alleppey'],
    image:
      'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80',
    priceInr: 56450,
  },
  {
    id: 'fallback-japan',
    tag: 'luxury',
    traveler: 'Rohan from Bengaluru',
    bookedAgo: '8 hr ago',
    title: 'Japan Spring Trail: Tokyo + Kyoto',
    details: 'Japan (7N/8D)',
    destinations: ['Tokyo', 'Kyoto'],
    image:
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200&q=80',
    priceInr: 219900,
  },
  {
    id: 'fallback-maldives',
    tag: 'honeymoon',
    traveler: 'Isha from Mumbai',
    bookedAgo: '10 hr ago',
    title: 'Maldives Water Villa Escape',
    details: 'Maldives (4N/5D)',
    destinations: ['Male', 'Maafushi'],
    image:
      'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80',
    priceInr: 174500,
  },
]

export function RecentlyBookedItineraries() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [bookedPackages, setBookedPackages] = useState(null)
  const [cmsBookedItems, setCmsBookedItems] = useState([])
  const cardsScrollRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetchPublic('packages')
      .then((rows) => {
        if (!alive) return
        const mapped = (Array.isArray(rows) ? rows : []).slice(0, 16).map((pkg, index) => ({
          tag:
            /honeymoon|couple|romance/i.test(String(pkg.title || ''))
              ? 'honeymoon'
              : /family|kids/i.test(String(pkg.title || ''))
                ? 'family'
                : Number(pkg.price || 0) > 150000
                  ? 'luxury'
                  : 'under150k',
          id: pkg.slug || String(pkg.id),
          traveler: travelerNames[index % travelerNames.length],
          bookedAgo: `${1 + index} hr ago`,
          title: pkg.title || 'Package',
          details: `${pkg.location || 'Curated destination'} (${pkg.duration || 'Custom'})`,
          destinations: (pkg.location || 'Bali').split(',').map((part) => part.trim()).filter(Boolean).slice(0, 2),
          image:
            mediaUrl(pkg.image_path) ||
            mediaUrl(pkg.cover_image) ||
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
          priceInr: Number(pkg.price || 0),
          linkUrl: `/packages/${normalizeSlug(pkg.slug || pkg.title || pkg.id)}`,
        }))
        setBookedPackages(mapped)
      })
      .catch(() => {
        if (!alive) return
        setBookedPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetchCmsItems('recently_itinerary')
      .then((rows) => {
        if (!alive) return
        const mapped = (Array.isArray(rows) ? rows : []).map((item, index) => {
          const fallbackTag =
            Number(item.price || 0) > 150000
              ? 'luxury'
              : /honeymoon|couple|romance/i.test(String(item.title || ''))
                ? 'honeymoon'
                : /family|kids/i.test(String(item.title || ''))
                  ? 'family'
                  : 'under150k'
          const tag = String(item.badge || fallbackTag || 'under150k').toLowerCase()
          const locations = (item.subtitle || item.title || '')
            .split(',')
            .map((part) => part.trim())
            .filter(Boolean)
            .slice(0, 2)
          return {
            tag,
            id: String(item.id || `recently-itinerary-${index}`),
            traveler: item.subtitle?.trim() || travelerNames[index % travelerNames.length],
            bookedAgo: item.duration?.trim() || `${index + 1} hr ago`,
            title: item.title || 'Package',
            details: `${item.subtitle || 'Curated destination'} (${item.duration || 'Custom'})`,
            destinations: locations.length > 0 ? locations : ['Curated'],
            image: mediaUrl(item.image_url) || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
            priceInr: Number(item.price || 0),
            linkUrl: item.link_url || '/packages',
          }
        })
        setCmsBookedItems(mapped)
      })
      .catch(() => {
        if (!alive) return
        setCmsBookedItems([])
      })
    return () => {
      alive = false
    }
  }, [])

  const visiblePackages = useMemo(() => {
    const sourcePackages = cmsBookedItems.length
      ? cmsBookedItems
      : Array.isArray(bookedPackages) && bookedPackages.length > 0
        ? bookedPackages
        : fallbackPackages
    if (activeFilter === 'all') return sourcePackages
    if (activeFilter === 'under150k') return sourcePackages.filter((pkg) => pkg.priceInr <= 150000)
    const filtered = sourcePackages.filter((pkg) => pkg.tag === activeFilter)
    return filtered.length > 0 ? filtered : sourcePackages
  }, [activeFilter, bookedPackages, cmsBookedItems])

  function handleCardsWheel(event) {
    const container = cardsScrollRef.current
    if (!container) return
    if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
    event.preventDefault()
    container.scrollBy({ left: event.deltaY, behavior: 'auto' })
  }

  return (
    <section className="bg-[#f5f7f6] py-14 lg:py-20" aria-labelledby="recently-booked-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="rounded-[28px] bg-white/80 p-6 ring-1 ring-black/5 lg:col-span-3">
            <h2 id="recently-booked-heading" className="font-display text-[2rem] font-semibold leading-[1.1] text-slate-900">
              RECENTLY BOOKED ITINERARIES
            </h2>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-honey/15 px-3 py-1.5 text-xs font-semibold text-neutral-900 ring-1 ring-honey/30">
              <span className="inline-block h-2 w-2 rounded-full bg-honey" />
              {bookedPackages ? `${Math.max(bookedPackages.length, 3)}+ trips booked last week` : 'Loading live bookings...'}
            </div>
          </div>

          <div className="lg:col-span-9">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {bookingFilters.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => setActiveFilter(filter.id)}
                  className={`rounded-full px-4 py-1.5 text-[11px] font-semibold transition sm:text-xs ${
                    activeFilter === filter.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:text-slate-900'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div
              ref={cardsScrollRef}
              onWheel={handleCardsWheel}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {visiblePackages.map((pkg) => (
                <article
                  key={pkg.id}
                  className="group min-w-[260px] max-w-[280px] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5"
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={pkg.image}
                      alt={pkg.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                    <p className="absolute left-3 top-3 rounded-full bg-black/65 px-2 py-1 text-[10px] font-medium text-white/95 backdrop-blur">
                      {pkg.traveler} · {pkg.bookedAgo}
                    </p>
                  </div>

                  <div className="p-4">
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{pkg.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">/{pkg.destinations.join('/')} · {pkg.details.split('(')[1]?.replace(')', '') || 'Custom'}</p>
                    <div className="mt-4 flex items-end justify-between gap-3">
                      <p className="text-[1.4rem] font-bold leading-none text-slate-900">{formatInr(pkg.priceInr)}</p>
                      <p className="mb-1 whitespace-nowrap text-[10px] text-slate-500">9 nights / per person</p>
                    </div>

                    <Link
                      to={pkg.linkUrl || '/packages'}
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-honey px-3 py-2 text-xs font-semibold text-neutral-950 transition hover:bg-honey-dark"
                    >
                      View details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
