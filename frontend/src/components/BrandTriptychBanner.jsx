import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Plane, Sparkles, ShieldCheck, Clock3 } from 'lucide-react'

const floatTransition = {
  y: { duration: 2.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' },
}

export function BrandTriptychBanner() {
  return (
    <section
      className="py-12 sm:py-16 lg:py-20"
      aria-labelledby="brand-triptych-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="relative overflow-hidden rounded-[2.25rem] border border-neutral-200 bg-neutral-950 shadow-2xl"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=2000&q=85"
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-45"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/55 to-amber-950/45" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,193,7,0.14),_transparent_55%)]" />

          <div className="relative z-10 grid gap-10 p-8 sm:p-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-honey text-sm font-bold text-neutral-900">
                  H
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/85">
                  HoneybeeTrips
                </span>
              </div>

              <h2
                id="brand-triptych-heading"
                className="mt-8 font-display text-4xl font-semibold leading-tight text-white sm:text-5xl"
              >
                Travel that feels calm — even when it’s far.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                We build clear routes, pick reliable stays, and keep a real human on-call. You get a trip that reads
                like a story, not a to-do list.
              </p>

              <div className="mt-7 flex flex-wrap gap-2">
                {[
                  { Icon: ShieldCheck, label: 'Vetted stays' },
                  { Icon: Clock3, label: 'Better pacing' },
                  { Icon: Sparkles, label: 'Small upgrades' },
                ].map(({ Icon, label }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80"
                  >
                    <Icon className="h-4 w-4 text-honey" strokeWidth={1.5} />
                    {label}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-3 rounded-full bg-honey px-6 py-3 text-sm font-semibold text-neutral-900 shadow-lg transition hover:bg-honey-dark"
                >
                  About Honeybee
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
                <Link
                  to="/packages"
                  className="inline-flex items-center gap-3 rounded-full border border-honey/60 bg-black/50 px-6 py-3 text-sm font-semibold text-honey shadow-lg backdrop-blur transition hover:bg-black/70"
                >
                  Browse packages
                  <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Concierge</p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Online
                  </span>
                </div>

                <h3 className="mt-4 font-sans text-xl font-bold text-white">
                  Need help mid‑trip?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  Message us for quick changes, confirmations, or local tips — without hunting for numbers.
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    { label: 'Hotel check‑in', value: 'Confirmed' },
                    { label: 'Airport transfer', value: 'Driver assigned' },
                    { label: 'Experience timing', value: 'Optimized' },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <span className="text-sm text-white/80">{row.label}</span>
                      <span className="text-sm font-semibold text-honey">{row.value}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/contact"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-100"
                >
                  Talk to concierge
                  <Plane className="h-4 w-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
