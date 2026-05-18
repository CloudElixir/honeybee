import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Flag, Sparkles } from 'lucide-react'
import { mediaUrl } from '../../api/adminPublic'
import { parseDayActivities } from './luxuryHelpers'

const NUM = 'font-sans tabular-nums tracking-tight'

function ActivityRow({ item }) {
  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50/90 px-4 py-3.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-lux-gold/15 text-lux-gold">
        <Sparkles className="h-4 w-4" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="text-sm leading-relaxed text-slate-600">
        {item.label ? (
          <>
            <span className="font-semibold text-slate-900">{item.label}:</span> {item.text}
          </>
        ) : (
          item.text
        )}
      </p>
    </div>
  )
}

/**
 * Bayard-style daily itinerary timeline (reference layout).
 */
export function BayardItinerarySection({
  rows,
  expandedDays,
  onToggleDay,
  onExpandAll,
  allExpanded,
}) {
  return (
    <section id="lux-itinerary" className="scroll-mt-24">
      <motion.div
        initial={false}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-sans text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Your <span className="text-lux-gold">Daily Itinerary</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              A carefully curated day-wise plan for your perfect adventure
            </p>
          </div>
          {rows.length > 0 ? (
            <button
              type="button"
              onClick={onExpandAll}
              className="rounded-lg border border-lux-gold/50 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-lux-black transition hover:border-lux-gold hover:bg-amber-50"
            >
              {allExpanded ? 'Collapse all days' : 'Expand all days'}
            </button>
          ) : null}
        </div>

        <div className="relative mt-10">
          {rows.length > 0 ? (
            <div
              className="pointer-events-none absolute bottom-6 left-[1.35rem] top-6 w-px bg-gradient-to-b from-lux-gold/25 via-lux-gold/70 to-lux-gold/25 sm:left-7"
              aria-hidden
            />
          ) : null}

          {rows.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-12 px-6 text-center text-sm text-slate-600">
              <p>
                No itinerary days yet. In <strong className="text-slate-800">Admin → Itineraries</strong>, choose{' '}
                <strong className="text-slate-800">Bali Romantic Escape</strong> from the package dropdown, then save each day.
              </p>
              {import.meta.env.DEV ? (
                <p className="mt-3 text-left text-[11px] leading-relaxed text-amber-900/90">
                  Local dev: run <code className="rounded bg-amber-100/80 px-1 font-mono">npm run dev</code> (starts PHP on
                  port 8000 + Vite). Do not use <code className="rounded bg-amber-100/80 px-1 font-mono">python -m http.server</code>{' '}
                  for the app — it cannot load CMS data. Remove{' '}
                  <code className="rounded bg-amber-100/80 px-1 font-mono">VITE_ADMIN_PUBLIC_BASE</code> from{' '}
                  <code className="rounded bg-amber-100/80 px-1 font-mono">frontend/.env</code> so itineraries use the same database as admin.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="space-y-5">
              {rows.map((row, idx) => {
                const open = expandedDays.has(row.id)
                const parsed = parseDayActivities(row.description)
                const imgs = Array.isArray(row.image_paths)
                  ? row.image_paths.map((p) => mediaUrl(p)).filter(Boolean)
                  : []
                const dn = Number(row.day_number)
                const displayDay = Number.isFinite(dn) && dn > 0 ? dn : idx + 1
                const dayLabel = displayDay >= 100 ? String(displayDay) : String(displayDay).padStart(2, '0')

                return (
                  <div key={row.id} className="relative flex gap-4 sm:gap-6">
                    <div
                      className="relative z-10 flex w-12 shrink-0 flex-col items-center justify-start rounded-xl bg-lux-gold py-2.5 text-center text-lux-black shadow-md shadow-lux-gold/35 sm:w-14"
                      aria-hidden
                    >
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-lux-black/70">Day</span>
                      <span className={`mt-0.5 text-2xl font-bold leading-none ${NUM}`}>{dayLabel}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <button
                          type="button"
                          onClick={() => onToggleDay(row.id)}
                          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left sm:px-6"
                          aria-expanded={open}
                        >
                          <span className="text-base font-semibold text-slate-900 sm:text-lg">{row.title}</span>
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-lux-gold/30 bg-amber-50/80 text-lux-gold">
                            <ChevronDown
                              className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`}
                              aria-hidden
                            />
                          </span>
                        </button>

                        <AnimatePresence initial={false}>
                          {open ? (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="space-y-3 border-t border-slate-100 px-5 py-4 sm:px-6">
                                {parsed.kind === 'html' ? (
                                  <div
                                    className="prose prose-sm prose-slate max-w-none"
                                    dangerouslySetInnerHTML={{ __html: parsed.html }}
                                  />
                                ) : parsed.items.length > 0 ? (
                                  parsed.items.map((item, actIdx) => (
                                    <ActivityRow key={`${row.id}-${actIdx}`} item={item} />
                                  ))
                                ) : (
                                  <p className="text-sm text-slate-500">Details coming soon.</p>
                                )}
                                {imgs.length > 0 ? (
                                  <div className="flex gap-2 overflow-x-auto pt-1">
                                    {imgs.map((src) => (
                                      <img
                                        key={src}
                                        src={src}
                                        alt=""
                                        className="h-24 w-36 shrink-0 rounded-xl object-cover ring-1 ring-slate-200"
                                        loading="lazy"
                                      />
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="relative flex gap-4 sm:gap-6">
                <div
                  className="relative z-10 flex w-12 shrink-0 items-center justify-center rounded-xl bg-lux-gold/20 py-3 sm:w-14"
                  aria-hidden
                >
                  <Flag className="h-6 w-6 text-lux-gold" strokeWidth={1.75} />
                </div>
                <div className="flex min-w-0 flex-1 items-center gap-4 rounded-2xl border border-lux-gold/40 bg-amber-50/90 px-5 py-4">
                  <div>
                    <p className="font-semibold text-neutral-900">End of Journey</p>
                    <p className="mt-0.5 text-sm text-neutral-600">Your adventure awaits!</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  )
}
