import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { fetchPublic } from '../api/adminPublic'

const initial = { name: '', phone: '', destination: '', dates: '', budget: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.phone.trim()) errors.phone = 'Phone is required'
  else if (!/^[\d\s+().-]{8,}$/.test(form.phone)) errors.phone = 'Enter a valid phone number'
  if (!form.destination) errors.destination = 'Choose a destination'
  if (!form.dates.trim()) errors.dates = 'Travel dates are required'
  if (!form.budget.trim()) errors.budget = 'Budget is required'
  return errors
}

const CUSTOM = 'Custom / not listed'

export function BookingModal() {
  const { open, closeBooking, prefill } = useBooking()
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [destinationNames, setDestinationNames] = useState([])

  useEffect(() => {
    let alive = true
    fetchPublic('destinations')
      .then((rows) => {
        if (!alive) return
        const names = (Array.isArray(rows) ? rows : [])
          .map((row) => String(row.name || '').trim())
          .filter(Boolean)
        setDestinationNames(Array.from(new Set(names)))
      })
      .catch(() => {
        if (!alive) return
        setDestinationNames([])
      })
    return () => {
      alive = false
    }
  }, [])

  const knownTitles = useMemo(() => destinationNames, [destinationNames])
  const selectOptions = useMemo(() => {
    const d = form.destination
    const extra =
      d && !knownTitles.includes(d) && d !== CUSTOM ? [d] : []
    return [...knownTitles, ...extra]
  }, [form.destination, knownTitles])

  useEffect(() => {
    if (open) {
      setForm((f) => ({
        ...f,
        ...prefill,
        destination: prefill.destination ?? f.destination ?? '',
      }))
      setErrors({})
      setSubmitted(false)
    }
  }, [open, prefill])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') closeBooking()
    }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, closeBooking])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    const v = validate(form)
    setErrors(v)
    if (Object.keys(v).length === 0) {
      setSubmitted(true)
      setTimeout(() => {
        closeBooking()
        setForm(initial)
        setSubmitted(false)
      }, 1800)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBooking}
            aria-label="Close dialog"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-title"
            className="fixed left-1/2 top-1/2 z-[120] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-card sm:p-8"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gold">Request a trip</p>
                <h2 id="booking-title" className="font-display text-2xl font-semibold text-neutral-900">
                  Book with HoneybeeTrips
                </h2>
                <p className="mt-1 text-sm text-neutral-600">
                  Share a few details — an advisor replies within one business day.
                </p>
              </div>
              <button
                type="button"
                onClick={closeBooking}
                className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <motion.p
                className="mt-8 rounded-xl bg-honey/15 px-4 py-6 text-center font-medium text-neutral-900"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
              >
                Thank you! We’ll be in touch shortly.
              </motion.p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="book-name" className="text-xs font-medium text-neutral-600">
                    Full name
                  </label>
                  <input
                    id="book-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="book-phone" className="text-xs font-medium text-neutral-600">
                    Phone
                  </label>
                  <input
                    id="book-phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
                    autoComplete="tel"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                </div>
                <div>
                  <label htmlFor="book-destination" className="text-xs font-medium text-neutral-600">
                    Destination
                  </label>
                  <select
                    id="book-destination"
                    name="destination"
                    value={form.destination}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
                  >
                    <option value="">Select…</option>
                    {selectOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value={CUSTOM}>{CUSTOM}</option>
                  </select>
                  {errors.destination && (
                    <p className="mt-1 text-xs text-red-600">{errors.destination}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="book-dates" className="text-xs font-medium text-neutral-600">
                    Travel dates
                  </label>
                  <input
                    id="book-dates"
                    name="dates"
                    placeholder="e.g. June 12–24, 2026"
                    value={form.dates}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
                  />
                  {errors.dates && <p className="mt-1 text-xs text-red-600">{errors.dates}</p>}
                </div>
                <div>
                  <label htmlFor="book-budget" className="text-xs font-medium text-neutral-600">
                    Budget (USD)
                  </label>
                  <input
                    id="book-budget"
                    name="budget"
                    placeholder="e.g. $6,000–8,000 for two"
                    value={form.budget}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/30"
                  />
                  {errors.budget && <p className="mt-1 text-xs text-red-600">{errors.budget}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                >
                  Submit request
                </button>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
