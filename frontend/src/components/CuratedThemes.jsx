import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCmsItems } from '../api/adminPublic'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

function formatInr(n) {
  return new Intl.NumberFormat('en-IN').format(n)
}

export function CuratedThemes() {
  const [items, setItems] = useState(null)

  useEffect(() => {
    let alive = true
    fetchCmsItems('curated_spotlight')
      .then((rows) => {
        if (!alive) return
        setItems(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setItems([])
      })
    return () => {
      alive = false
    }
  }, [])

  const cards = useMemo(
    () =>
      (items || []).map((item) => ({
        id: item.id,
        place: item.title,
        line: item.subtitle || 'Curated itinerary',
        price: Number(item.price || 0),
        image: item.image_url || FALLBACK_IMAGE,
        to: item.link_url || '/packages',
      })),
    [items]
  )

  return (
    <section
      className="bg-neutral-50 py-16 lg:py-24"
      aria-labelledby="curated-themes-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="curated-themes-heading" className="font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Curated Spotlights</h2>
        <p className="mt-2 max-w-2xl text-base text-slate-500 sm:text-lg">
          Manage these spotlight cards from admin CMS using section key `curated_spotlight`.
        </p>
        {items === null && <p className="mt-6 text-sm text-slate-600">Loading curated cards...</p>}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((item) => (
            <Link key={item.id} to={item.to} className="group relative min-h-[220px] overflow-hidden rounded-[22px] border border-neutral-200 bg-black shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <img src={item.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <span className="absolute right-3 top-3 rounded-[10px_18px_10px_18px] bg-honey px-2.5 py-1 text-xs font-bold text-neutral-900 shadow-sm">₹ {formatInr(item.price)}</span>
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <p className="font-sans text-lg font-bold text-white sm:text-xl">{item.place}</p>
                <p className="mt-1 line-clamp-2 text-sm text-white/80">{item.line}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
