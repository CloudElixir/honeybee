import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import { fetchCmsItems } from '../api/adminPublic'

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

export function GroupDepartures() {
  const [heroCards, setHeroCards] = useState([])

  useEffect(() => {
    let alive = true
    fetchCmsItems('group_departures')
      .then((rows) => {
        if (!alive) return
        const mapped = (Array.isArray(rows) ? rows : []).slice(0, 3).map((row) => ({
          id: row.id,
          title: row.title,
          place: row.subtitle || 'Curated route',
          image: row.image_url || FALLBACK_IMAGE,
          to: row.link_url || '/packages',
        }))
        setHeroCards(mapped)
      })
      .catch(() => {
        if (!alive) return
        setHeroCards([])
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-neutral-950 py-16 lg:py-24"
      aria-labelledby="group-departures-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,171,0.22),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.2),transparent_55%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="inline-flex items-center gap-1 rounded-full bg-honey/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-honey">
              <Sparkles className="h-3.5 w-3.5" />
              Honeybee curated moments
            </p>
            <h2
              id="group-departures-heading"
              className="mt-3 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl"
            >
              Velvet frames from real journeys
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-white/75 sm:text-base">
              A quick strip of moods from recent Honeybee trips — save what inspires you and we&apos;ll
              weave your version of it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/packages"
              className="inline-flex items-center gap-2 rounded-full border border-honey/70 bg-honey px-5 py-2.5 text-sm font-semibold text-neutral-900 shadow-[0_0_35px_rgba(250,204,21,0.55)] transition hover:bg-honey-dark"
            >
              View curated journeys
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {heroCards.length === 0 && (
            <p className="col-span-3 rounded-xl border border-dashed border-white/30 p-4 text-sm text-white/70">
              Add CMS items in section `group_departures` to populate this area.
            </p>
          )}
          {heroCards.map((card, idx) => (
            <Link
              key={card.id}
              to={card.to}
              className="group relative flex h-[260px] items-end overflow-hidden rounded-[32px] bg-neutral-900 shadow-xl ring-1 ring-white/5 transition-transform duration-300 hover:-translate-y-1 hover:ring-honey/70"
            >
              <div className="pointer-events-none absolute inset-0">
                <img
                  src={card.image}
                  alt={card.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/5" />
                <div className="absolute inset-0 opacity-0 mix-blend-screen transition-opacity duration-300 group-hover:opacity-100">
                  <div className="absolute -inset-10 bg-[radial-gradient(circle_at_top,rgba(250,204,21,0.4),transparent_55%)]" />
                </div>
              </div>

              <div className="relative z-10 flex w-full flex-col gap-2 px-5 pb-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-honey/90">
                  {idx === 0 ? 'Sunset small groups' : idx === 1 ? 'Slow crafted circuits' : 'Story-rich escapes'}
                </p>
                <h3 className="line-clamp-2 font-display text-lg font-semibold text-white">
                  {card.title}
                </h3>
                <p className="text-xs text-white/70">{card.place}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
