import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { fetchCmsItems } from '../api/adminPublic'

const PEACH = '#F5C899'
const GAP = 16
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

export function LuxuryEscapes() {
  const { openBooking } = useBooking()
  const [active, setActive] = useState(0)
  const scrollerRef = useRef(null)
  const [cards, setCards] = useState([])

  useEffect(() => {
    let alive = true
    fetchCmsItems('luxury_escapes')
      .then((rows) => {
        if (!alive) return
        const mapped = (Array.isArray(rows) ? rows : []).map((row) => ({
          id: row.id,
          label: row.title,
          image: row.image_url || FALLBACK_IMAGE,
          to: row.link_url || '/packages',
        }))
        setCards(mapped)
      })
      .catch(() => {
        if (!alive) return
        setCards([])
      })
    return () => {
      alive = false
    }
  }, [])

  const scrollByDir = useCallback((dir) => {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector('[data-lux-card]')
    const step = (card?.offsetWidth ?? 260) + GAP
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => {
      const card = el.querySelector('[data-lux-card]')
      const w = (card?.offsetWidth ?? 260) + GAP
      const i = Math.round(el.scrollLeft / Math.max(w, 1))
      setActive(Math.min(Math.max(i, 0), Math.max(cards.length - 1, 0)))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [cards.length])

  return (
    <section
      className="relative overflow-hidden bg-neutral-950 py-16 lg:py-24"
      aria-labelledby="luxury-escapes-heading"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-950 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(253,224,171,0.24),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.22),transparent_52%)]" />

        {/* animated glow blobs */}
        <div className="absolute -top-28 left-[-8%] h-96 w-96 rounded-full bg-[#FBBF24] blur-3xl opacity-45 hb-blob-a" />
        <div className="absolute -bottom-32 right-[-6%] h-[520px] w-[520px] rounded-full bg-[#0B1220] blur-3xl opacity-55 hb-blob-b" />

        {/* subtle luxury line texture */}
        <div className="absolute inset-0 opacity-[0.22] hb-flight-bg" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <h2
              id="luxury-escapes-heading"
              className="font-sans text-2xl font-bold uppercase tracking-[0.28em] text-honey sm:text-3xl"
            >
              Velvet getaway gallery
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">
              A quick scroll of high-comfort places — shaped like a moodboard, not a catalog.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row lg:flex-col lg:items-end">
            <Link
              to="/destinations"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-honey/70 bg-gradient-to-r from-honey/90 to-amber-300/90 px-6 py-3 text-sm font-semibold text-neutral-950 shadow-[0_0_40px_rgba(250,204,21,0.45)] transition hover:shadow-[0_0_60px_rgba(250,204,21,0.75)]"
            >
              View elite escapes
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => openBooking()}
              className="inline-flex items-center justify-center rounded-full border border-honey/60 bg-neutral-950/70 px-6 py-3 text-sm font-semibold text-honey shadow-lg shadow-amber-500/10 backdrop-blur-md transition hover:border-honey hover:bg-neutral-900/90 hover:shadow-amber-400/40"
            >
              Consult a journey artist
            </button>
          </div>
        </div>

        <div className="relative mt-10 md:mt-12">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            className="absolute left-0 top-1/2 z-20 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-honey/70 bg-neutral-900/80 text-honey shadow-lg shadow-amber-500/30 backdrop-blur-md transition hover:bg-neutral-800 md:flex"
            aria-label="Previous"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            className="absolute right-0 top-1/2 z-20 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-honey/70 bg-neutral-900/80 text-honey shadow-lg shadow-amber-500/30 backdrop-blur-md transition hover:bg-neutral-800 md:flex"
            aria-label="Next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            ref={scrollerRef}
            className="scrollbar-hide flex gap-4 overflow-x-auto pb-2 pt-2 md:px-12"
          >
            {cards.map((c, i) => (
              <Link
                key={c.id}
                data-lux-card
                to={c.to}
                onFocus={() => setActive(i)}
                className={`group relative h-[min(360px,60vh)] w-[min(230px,74vw)] shrink-0 snap-start overflow-hidden shadow-xl ring-2 transition-all duration-300 sm:w-[min(250px,44vw)] lg:w-[min(260px,18vw)] ${
                  i === active
                    ? 'ring-honey/90 ring-offset-2 ring-offset-neutral-950 shadow-[0_0_45px_rgba(250,204,21,0.55)]'
                    : 'ring-white/5 hover:ring-honey/70 hover:shadow-[0_0_35px_rgba(250,204,21,0.45)]'
                }`}
                style={{ borderRadius: '28px' }}
              >
                <div className="pointer-events-none absolute -inset-10 rounded-full bg-transparent blur-2xl transition-all duration-300 group-hover:bg-[rgba(250,204,21,0.25)]" />
                <img src={c.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <p className="absolute bottom-0 left-0 right-0 p-4 text-center font-sans text-sm font-bold uppercase tracking-[0.22em] text-white/95">
                  {c.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
