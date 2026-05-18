import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchCmsItems } from '../api/adminPublic'

const GAP_PX = 18

const RATINGS = [
  { label: 'Google', score: '4.9', reviews: '21K+ reviews', brand: 'G' },
  { label: 'Facebook', score: '4.8', reviews: '14K+ reviews', brand: 'f' },
]

const STORIES = [
  {
    id: 'aishwarya-bali',
    name: 'Aishwarya Bali Holiday',
    tag: 'Bali',
    location: 'Indonesia',
    cover:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'harish-thailand',
    name: 'Harish Thailand Holiday',
    tag: 'Thailand',
    location: 'Thailand',
    cover:
      'https://images.unsplash.com/photo-1528181304800-259b08848526?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'priyadarshini-singapore',
    name: 'Priyadarshini & Family',
    tag: 'Singapore',
    location: 'Singapore',
    cover:
      'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'manesh-europe',
    name: 'Manesh Europe Holiday',
    tag: 'Europe',
    location: 'Europe',
    cover:
      'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'sneha-vietnam',
    name: 'Sneha Vietnam Holiday',
    tag: 'Vietnam',
    location: 'Vietnam',
    cover:
      'https://images.unsplash.com/photo-1528127269322-539801943592?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 'rahul-maldives',
    name: 'Rahul Maldives Escape',
    tag: 'Maldives',
    location: 'Maldives',
    cover:
      'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=900&q=80&auto=format&fit=crop',
  },
]

export function LoveFromTheGram() {
  const scrollerRef = useRef(null)
  const [cmsStories, setCmsStories] = useState(null)

  useEffect(() => {
    let alive = true
    fetchCmsItems('gram')
      .then((rows) => {
        if (!alive) return
        setCmsStories(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setCmsStories([])
      })
    return () => {
      alive = false
    }
  }, [])

  const stories = useMemo(() => {
    const mapped = (cmsStories || []).map((item) => ({
      id: item.id,
      name: item.title,
      tag: item.badge || 'Story',
      location: item.subtitle || 'Traveler',
      cover: item.image_url,
    }))
    return mapped.length > 0 ? mapped : STORIES
  }, [cmsStories])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-gram-card]')
    const step = (card?.offsetWidth ?? 260) + GAP_PX
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-[#fdfaf5] via-stone-100/90 to-[#f0ebe3] py-14 sm:py-16"
      aria-labelledby="love-from-gram-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(circle at 20% 0%, rgba(250, 204, 21, 0.12) 0%, transparent 45%),
            radial-gradient(circle at 80% 100%, rgba(120, 113, 108, 0.08) 0%, transparent 40%)`,
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-800/80">
            HoneyBee moments
          </p>
          <h2
            id="love-from-gram-heading"
            className="mt-2 font-sans text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl"
          >
            Traveler Highlights
          </h2>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-neutral-700">
            {RATINGS.map((r) => (
              <div
                key={r.label}
                className="flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-4 py-2 shadow-sm shadow-stone-900/5 backdrop-blur-sm"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 font-black text-honey">
                  {r.brand}
                </span>
                <span className="font-semibold text-neutral-900">{r.score}</span>
                <span className="text-neutral-500">{r.reviews}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-10">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-lg shadow-stone-900/10 transition hover:border-honey/50 hover:text-neutral-950 md:flex"
            aria-label="Previous stories"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-lg shadow-stone-900/10 transition hover:border-honey/50 hover:text-neutral-950 md:flex"
            aria-label="Next stories"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollerRef}
            className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-[18px] overflow-x-auto pb-2 pl-1 pr-1 md:mx-0 md:px-12"
          >
            {stories.map((s) => (
              <article
                key={s.id}
                data-gram-card
                className="relative h-[360px] w-[240px] shrink-0 snap-start overflow-hidden rounded-[28px] border border-neutral-200/90 bg-white shadow-xl shadow-stone-900/15 ring-1 ring-black/[0.04] sm:h-[400px] sm:w-[260px]"
              >
                <div className="absolute inset-0">
                  <img
                    src={s.cover}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />
                </div>

                <div className="relative z-10 flex h-full flex-col justify-end p-4">
                  <p className="text-sm font-semibold text-white">{s.name}</p>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/90 backdrop-blur">
                      {s.tag}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur">
                      {s.location}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-4 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollByDir(-1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDir(1)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

