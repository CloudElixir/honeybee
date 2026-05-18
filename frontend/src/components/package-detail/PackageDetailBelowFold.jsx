import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { mediaUrl } from '../../api/adminPublic'
import { formatInr, normalizeSlug } from './luxuryHelpers'

const NUM = 'font-sans tabular-nums tracking-tight'

function StarRow({ count }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(count) || 0)))
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: n }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-lux-gold text-lux-gold" aria-hidden />
      ))}
    </span>
  )
}

export function PackageDetailBelowFold({
  relatedSlice,
  gallery,
  storyReviews,
  storyIndex,
  setStoryIndex,
  reelPoster,
  faqBlocks,
  horizontalScroll = false,
}) {
  const relatedScrollCls = horizontalScroll
    ? '-mx-4 mt-8 flex gap-5 overflow-x-auto px-4 pb-3 snap-x snap-mandatory'
    : 'mt-8 flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory'

  return (
    <>
      {relatedSlice.length > 0 && (
        <motion.section
          id="lux-related"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            More <span className="text-lux-gold">adventures</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-500">Related packages from your CMS.</p>
          <div className={relatedScrollCls}>
            {relatedSlice.map((p) => {
              const pSlug = normalizeSlug(p.slug || p.title || p.id)
              const img = mediaUrl(p.image_path) || gallery[0]
              const trending = Number(p.is_trending) === 1 || Number(p.is_featured) === 1
              return (
                <Link
                  key={p.id}
                  to={`/packages/${pSlug}`}
                  className="group relative w-[min(100%,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-soft transition hover:border-lux-gold/50"
                >
                  <div className="relative aspect-[4/3]">
                    <img src={img} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    {trending && (
                      <span className="absolute left-3 top-3 rounded-full bg-lux-gold px-2 py-0.5 text-[10px] font-bold uppercase text-lux-black">
                        Trending
                      </span>
                    )}
                    <span className="absolute bottom-3 right-3 rounded-full bg-lux-gold/95 px-2 py-1 text-[10px] font-bold text-lux-black shadow-sm shadow-lux-gold/35">
                      {p.duration || '—'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-display text-lg font-semibold text-neutral-900 group-hover:text-lux-gold">{p.title}</h3>
                    <p className={`mt-2 text-lg font-semibold text-lux-gold ${NUM}`}>{formatInr(p.price)}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      View
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </motion.section>
      )}

      {storyReviews.length > 0 && (
        <motion.section
          id="lux-stories"
          initial={false}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-[2rem] border-2 border-lux-gold/35 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/70 p-6 shadow-[0_0_48px_-12px_rgba(244,196,0,0.3)] sm:p-10"
        >
          <h2 className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
            Guest <span className="text-lux-gold">stories</span>
          </h2>
          <p className="mt-2 text-sm text-neutral-600">Reviews from travelers who booked with HoneyBee Trips.</p>
          <div className="mt-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="relative mx-auto w-full max-w-[260px]">
              <div className="aspect-[9/16] overflow-hidden rounded-[2rem] border-2 border-lux-gold/40 bg-neutral-100 shadow-[0_0_32px_-4px_rgba(244,196,0,0.35)]">
                <img src={reelPoster} alt="" className="h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-950/45 via-neutral-900/15 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex justify-end gap-2">
                  <span className="rounded-full border border-lux-gold/40 bg-white/90 px-3 py-1 text-[10px] font-semibold text-neutral-800 shadow-[0_0_12px_2px_rgba(244,196,0,0.35)]">
                    Moments
                  </span>
                </div>
              </div>
            </div>
            <div className="relative min-h-[280px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={storyReviews[storyIndex]?.id || storyIndex}
                  initial={false}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-2xl border border-lux-gold/25 bg-white p-6 text-neutral-800 shadow-soft shadow-[0_0_28px_-6px_rgba(244,196,0,0.28)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-display text-lg font-semibold text-neutral-900">
                        {storyReviews[storyIndex]?.name || 'Traveler'}
                      </p>
                      <p className="text-xs text-neutral-400">{storyReviews[storyIndex]?.route || 'HoneyBee guest'}</p>
                    </div>
                    <StarRow count={storyReviews[storyIndex]?.rating} />
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-neutral-700">
                    &ldquo;{storyReviews[storyIndex]?.text}&rdquo;
                  </p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  type="button"
                  aria-label="Previous review"
                  onClick={() =>
                    setStoryIndex((i) => (i - 1 + storyReviews.length) % storyReviews.length)
                  }
                  className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 shadow-sm hover:border-lux-gold/50 hover:shadow-[0_0_16px_-2px_rgba(244,196,0,0.45)]"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next review"
                  onClick={() => setStoryIndex((i) => (i + 1) % storyReviews.length)}
                  className="rounded-full border border-neutral-200 bg-white p-2 text-neutral-800 shadow-sm hover:border-lux-gold/50 hover:shadow-[0_0_16px_-2px_rgba(244,196,0,0.45)]"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </motion.section>
      )}


      {faqBlocks.length > 0 && (
        <motion.section id="lux-faq" initial={false} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="font-display text-3xl font-semibold tracking-tight">
            Frequently asked <span className="text-lux-gold">questions</span>
          </h2>
          <div className="mt-6 space-y-3">
            {faqBlocks.map((f) => (
              <div key={f.q} className="rounded-xl border border-neutral-100 bg-white p-4 shadow-sm">
                <p className="font-semibold text-lux-gold">{f.q}</p>
                <p className="mt-2 text-sm text-neutral-600">{f.a}</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

    </>
  )
}
