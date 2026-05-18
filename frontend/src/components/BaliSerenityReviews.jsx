/**
 * Bali Serenity — customer video strip (below blogs). Horizontal scroll only.
 * Set `src` on each entry to your MP4 URL (e.g. `/videos/guest-1.mp4` in `public/videos/`).
 */
import { useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { Link } from 'react-router-dom'

const GAP = 20

const CUSTOMER_VIDEOS = [
  {
    id: 'v1',
    traveler: 'Family — Ubud week',
    tripNote: 'Slow mornings & rice terraces',
    poster:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v2',
    traveler: 'Couple — Seminyak',
    tripNote: 'Sunsets & beach clubs',
    poster:
      'https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v3',
    traveler: 'Friends — Nusa day',
    tripNote: 'Cliffs & boat day',
    poster:
      'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v4',
    traveler: 'Solo traveler',
    tripNote: 'Temple morning + spa',
    poster:
      'https://images.unsplash.com/photo-1573790387438-4da905039b20?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v5',
    traveler: 'Parents + teens',
    tripNote: 'Culture without rush',
    poster:
      'https://images.unsplash.com/photo-1544644181-3c94a60bfefb?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v6',
    traveler: 'Anniversary',
    tripNote: 'Villa nights & dining',
    poster:
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v7',
    traveler: 'Honeymoon',
    tripNote: 'East coast hideaway',
    poster:
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v8',
    traveler: 'Singapore long weekend',
    tripNote: 'Tight schedule, smooth handoffs',
    poster:
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
  {
    id: 'v9',
    traveler: 'First-time Bali',
    tripNote: 'Arrival day made easy',
    poster:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=960&q=82',
    src: '',
  },
]

function VideoTile({ item }) {
  const hasVideo = Boolean(item.src && String(item.src).trim())

  return (
    <figure
      data-bali-video-card
      className="group relative w-[min(300px,calc(100vw-2.75rem))] shrink-0 snap-center overflow-hidden rounded-[1.35rem_2.1rem_1.35rem_2.1rem] border border-white/10 bg-neutral-950 shadow-[0_22px_55px_-18px_rgba(0,0,0,0.55)] ring-1 ring-black/40 transition duration-300 hover:-translate-y-1 hover:ring-honey/35 sm:w-[min(320px,calc(100vw-3rem))]"
    >
      <div className="pointer-events-none absolute -inset-px rounded-[inherit] bg-gradient-to-br from-honey/25 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
      <div className="relative aspect-video w-full bg-neutral-900">
        {hasVideo ? (
          <video
            className="relative z-[1] h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={item.poster}
            src={item.src}
          />
        ) : (
          <>
            <img
              src={item.poster}
              alt=""
              className="relative z-[1] h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
              loading="lazy"
            />
            <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/85 via-black/30 to-black/35" />
            <div className="absolute inset-0 z-[1] flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 text-neutral-900 shadow-xl ring-4 ring-black/25 backdrop-blur-sm transition group-hover:scale-105">
                <Play className="ml-1 h-7 w-7 fill-current" strokeWidth={0} aria-hidden />
              </span>
            </div>
            <span className="absolute left-3 top-3 z-[2] rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-honey backdrop-blur-sm">
              Video soon
            </span>
          </>
        )}
      </div>
      <figcaption className="relative z-[1] space-y-0.5 bg-neutral-950 px-4 py-3.5 text-left">
        <p className="text-sm font-semibold text-white">{item.traveler}</p>
        <p className="text-xs text-white/65">{item.tripNote}</p>
      </figcaption>
    </figure>
  )
}

export function BaliSerenityReviews() {
  const scrollRef = useRef(null)

  const scrollBy = useCallback((dir) => {
    const el = scrollRef.current
    if (!el) return
    const card = el.querySelector('[data-bali-video-card]')
    const w = card?.getBoundingClientRect().width ?? 300
    el.scrollBy({ left: dir * (w + GAP), behavior: 'smooth' })
  }, [])

  return (
    <section
      className="relative overflow-hidden border-y border-neutral-200/80 bg-gradient-to-b from-neutral-100 via-neutral-50 to-amber-50/40 py-14 sm:py-16"
      aria-labelledby="bali-serenity-videos-heading"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(250, 204, 21, 0.12), transparent),
            radial-gradient(circle at 90% 90%, rgba(0, 0, 0, 0.04), transparent 40%)`,
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-900/80">On camera</p>
            <h2
              id="bali-serenity-videos-heading"
              className="mt-2 font-display text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl"
            >
              Real guests, real Bali Serenity moments
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base">
              One continuous film strip — drag sideways or use the arrows. Link each tile to an MP4 when your clips are
              ready; until then, posters keep the frame.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex w-fit items-center gap-2 self-start rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-semibold text-honey shadow-md transition hover:bg-neutral-800 lg:self-end"
          >
            Plan your Bali story
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <div className="relative mt-10">
          <div className="pointer-events-none absolute -left-4 top-6 hidden h-[calc(100%-3rem)] w-8 rounded-full bg-gradient-to-r from-neutral-100 to-transparent md:block" />
          <div className="pointer-events-none absolute -right-4 top-6 hidden h-[calc(100%-3rem)] w-8 rounded-full bg-gradient-to-l from-neutral-100 to-transparent md:block" />

          <div
            className="relative rounded-[2rem] border border-neutral-200/90 bg-white/50 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] backdrop-blur-md sm:p-4 md:px-12 md:py-5"
            style={{
              backgroundImage:
                'repeating-linear-gradient(-60deg, transparent, transparent 14px, rgba(0,0,0,0.03) 14px, rgba(0,0,0,0.03) 15px)',
            }}
          >
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="absolute left-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-lg transition hover:border-honey hover:text-neutral-950 md:flex md:left-3"
              aria-label="Scroll videos left"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={2} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="absolute right-1 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-lg transition hover:border-honey hover:text-neutral-950 md:flex md:right-3"
              aria-label="Scroll videos right"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={2} />
            </button>

            <div
              ref={scrollRef}
              className="scrollbar-hide flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-visible py-2 pl-1 pr-1 [scrollbar-gutter:stable]"
            >
              {CUSTOMER_VIDEOS.map((item) => (
                <VideoTile key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-800 shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
