import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Mail,
  User,
  Phone,
  MessageSquare,
  MapPin,
  Check,
} from 'lucide-react'
import { fetchCmsItems } from '../api/adminPublic'

const initial = { name: '', email: '', phone: '', message: '' }
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'Required'
  if (!f.email.trim()) e.email = 'Required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Invalid email'
  if (!f.phone.trim()) e.phone = 'Required'
  if (!f.message.trim()) e.message = 'Required'
  return e
}

export function InspireLeadBand() {
  const [index, setIndex] = useState(0)
  const [cards, setCards] = useState([])
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)
  const card = cards[index] || null

  useEffect(() => {
    let alive = true
    fetchCmsItems('inspire_deals')
      .then((rows) => {
        if (!alive) return
        const mapped = (Array.isArray(rows) ? rows : []).map((row) => ({
          id: row.id,
          title: row.title,
          sub: row.subtitle || 'Curated deal',
          image: row.image_url || FALLBACK_IMAGE,
          tag: row.badge || 'Deal',
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

  const prev = () => {
    if (cards.length === 0) return
    setIndex((i) => (i - 1 + cards.length) % cards.length)
  }
  const next = () => {
    if (cards.length === 0) return
    setIndex((i) => (i + 1) % cards.length)
  }

  function onSubmit(ev) {
    ev.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length) return
    setSent(true)
    setForm(initial)
  }

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-b from-slate-100 to-white py-16 lg:py-24"
      aria-labelledby="inspire-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2260%22%20height=%2260%22%3E%3Ccircle%20cx=%221%22%20cy=%221%22%20r=%221%22%20fill=%22%23e2e8f0%22/%3E%3C/svg%3E')] opacity-40" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          <div className="relative mx-auto w-full max-w-md lg:mx-0">
            <div className="relative aspect-[4/5] w-full max-w-sm">
              {!card && (
                <div className="absolute inset-0 rounded-3xl bg-slate-200/70 p-4 text-sm text-slate-600">
                  Add CMS items in section `inspire_deals` to populate this block.
                </div>
              )}
              {card && (
                <>
                  <div
                    className="absolute inset-0 translate-x-3 translate-y-3 rounded-3xl bg-slate-300/60 shadow-inner"
                    aria-hidden
                  />
                  <div
                    className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-3xl bg-slate-200/90 shadow-md"
                    aria-hidden
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={card.id}
                      className="absolute inset-0 overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10"
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.35 }}
                    >
                      <Link to={card.to} className="relative block h-full w-full">
                        <img src={card.image} alt="" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur">
                          {card.tag}
                        </span>
                        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                          <div>
                            <h3 className="font-sans text-2xl font-bold text-white">{card.title}</h3>
                            <p className="mt-1 flex items-center gap-1 text-sm text-white/85">
                              <MapPin className="h-4 w-4 text-honey" />
                              {card.sub}
                            </p>
                          </div>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-blue-900">
                            View deal
                            <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>
            <div className="mt-6 flex justify-center gap-3">
              <button
                type="button"
                onClick={prev}
                disabled={cards.length === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow"
                aria-label="Previous deal"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                disabled={cards.length === 0}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-800 text-white shadow-md"
                aria-label="Next deal"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Mail className="h-3.5 w-3.5" />
              Get in touch
            </p>
            <h2
              id="inspire-heading"
              className="mt-4 font-sans text-3xl font-bold tracking-tight text-[#0a2463] sm:text-4xl"
            >
              Let us inspire you
            </h2>
            <p className="mt-2 text-neutral-600">
              Share your details — our travel experts will help you plan your dream vacation.
            </p>

            {sent ? (
              <p className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-900">
                Thanks — we’ll call you back shortly.
              </p>
            ) : (
              <form onSubmit={onSubmit} className="mt-8 space-y-4" noValidate>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                <div className="relative">
                  <MessageSquare className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <textarea
                    rows={4}
                    placeholder="Enter your message"
                    value={form.message}
                    onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>

                <ul className="space-y-2 text-xs text-neutral-600">
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    We protect your contact data and use it only to reach you about this request.
                  </li>
                  <li className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    No spam — unsubscribe anytime.
                  </li>
                </ul>

                <button
                  type="submit"
                  className="w-full rounded-full bg-[#0a2463] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-blue-950 sm:w-auto sm:px-12"
                >
                  Request call back
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
