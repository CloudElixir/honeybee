import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShieldCheck,
  LayoutGrid,
  Crown,
  Headphones,
  Gem,
  Sparkles,
  Bot,
  Users,
  ArrowUpRight,
} from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Reliability',
    text: "We're with you every step, ensuring a seamless travel experience.",
  },
  {
    icon: LayoutGrid,
    title: 'Customized',
    text: "One size doesn't fit all — so why should one itinerary?",
  },
  {
    icon: Crown,
    title: 'Exclusive',
    text: 'Curated experiences and hidden gems reserved for our travelers.',
  },
  {
    icon: Headphones,
    title: '24/7 support',
    text: 'Dedicated advisors whenever and wherever you need them.',
  },
  {
    icon: Gem,
    title: 'Unique',
    text: "You won't just visit destinations — you'll connect with them.",
  },
  {
    icon: Sparkles,
    title: 'Stress-free',
    text: 'We promise beautiful memories with zero spreadsheet stress.',
  },
]

export function WhyChooseHoneybee() {
  return (
    <section
      className="relative overflow-hidden bg-neutral-950 py-16 lg:py-24"
      aria-labelledby="why-choose-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,193,7,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-honey/40 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-start">
          <div className="lg:col-span-6">
            <p className="inline-flex rounded-full border border-honey/40 bg-white/5 px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-honey">
              The Honeybee difference
            </p>
            <h2
              id="why-choose-heading"
              className="mt-6 font-sans text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.35rem]"
            >
              Trips that feel smooth —{' '}
              <span className="text-honey">before</span> you book and{' '}
              <span className="text-honey">after</span> you land.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
              We design travel like a product: clear plan, clean pacing, reliable partners, and support that actually
              answers. You get freedom without losing structure.
            </p>

            <div className="mt-8 rounded-3xl border border-honey/25 bg-gradient-to-br from-white/10 to-white/5 p-5">
              <div className="flex flex-wrap gap-2">
                {[
                  'No spreadsheet stress',
                  'Clear day plans',
                  'Curated stays',
                  'Fast support',
                  'Better pacing',
                ].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-semibold text-white/80"
                  >
                    {pill}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-honey text-neutral-900">
                  <Bot className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">AI-first draft, human-finished plan</p>
                  <p className="mt-0.5 text-xs text-white/65">Get ideas instantly — our team refines the details.</p>
                </div>
              </div>
            </div>

            <Link
              to="/packages"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-honey px-8 py-3.5 text-sm font-bold text-[#001a41] shadow-[0_0_24px_-4px_rgba(255,193,7,0.45)] transition hover:bg-honey-dark"
            >
              Browse packages
              <ArrowUpRight className="h-5 w-5" strokeWidth={2} />
            </Link>
          </div>

          <div className="lg:col-span-6">
            <div className="grid gap-3 sm:grid-cols-2">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-neutral-900">
                      <f.icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h3 className="font-sans text-sm font-bold uppercase tracking-[0.14em] text-honey">
                        {f.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/75">{f.text}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {[
                { Icon: Users, title: '18,000+ travelers', text: 'Real trips, real reviews, repeat bookings.' },
                { Icon: Headphones, title: '24/7 support', text: 'Reach us when plans shift — we’ll help.' },
              ].map(({ Icon, title, text }) => (
                <div key={title} className="rounded-3xl border border-honey/20 bg-black/40 p-5">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-honey text-neutral-900">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-white/65">{text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
