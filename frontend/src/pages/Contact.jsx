import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, MessageCircle, Send } from 'lucide-react'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'

const WHATSAPP = 'https://wa.me/15551234567?text=Hi%20HoneybeeTrips%2C%20I%27d%20like%20to%20get%20in%20touch.'

const initial = { name: '', email: '', message: '' }

function validate(form) {
  const errors = {}
  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email'
  if (!form.message.trim()) errors.message = 'Message is required'
  else if (form.message.trim().length < 10) errors.message = 'Please add a bit more detail (10+ characters)'
  return errors
}

export function Contact() {
  useSeo({
    title: 'Contact',
    description: 'Contact HoneybeeTrips — message, phone, WhatsApp, or visit our studio on the map.',
  })
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState({})
  const [sent, setSent] = useState(false)

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
      setSent(true)
      setForm(initial)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        titleId="contact-title"
        eyebrow="Hello"
        title="Contact HoneybeeTrips"
        subtitle="Planning questions, media, or a spark of an idea — we read every message."
      />

      <div className="grid gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-neutral-900">Send a note</h2>
            {sent ? (
              <p className="mt-6 rounded-xl bg-honey/15 px-4 py-4 text-sm font-medium text-neutral-900">
                Thanks — your message is on its way. We typically reply within one business day.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
                <div>
                  <label htmlFor="contact-name" className="text-xs font-medium text-neutral-600">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
                    autoComplete="name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="contact-email" className="text-xs font-medium text-neutral-600">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
                    autoComplete="email"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="contact-message" className="text-xs font-medium text-neutral-600">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className="mt-1 w-full resize-y rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/25"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
                </div>
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-900 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 sm:w-auto sm:px-8"
                >
                  <Send className="h-4 w-4" />
                  Send message
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row">
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-4 text-sm font-semibold text-white transition hover:brightness-110"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp us
            </a>
            <a
              href="tel:+15551234567"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-5 py-4 text-sm font-semibold text-neutral-900 transition hover:border-honey"
            >
              <Phone className="h-5 w-5 text-gold" />
              +1 (555) 123-4567
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="flex flex-col gap-6"
        >
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-card">
            <div className="flex items-start gap-3">
              <Mail className="mt-1 h-5 w-5 text-gold" />
              <div>
                <h3 className="font-semibold text-neutral-900">Email</h3>
                <a href="mailto:hello@honeybeetrips.com" className="text-sm text-neutral-600 hover:text-honey-dark">
                  hello@honeybeetrips.com
                </a>
              </div>
            </div>
            <p className="mt-4 text-sm text-neutral-600 leading-relaxed">
              For trip briefs, attach dates and dream destinations — even rough ones. We’ll take it from there.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-neutral-100 shadow-card">
            <iframe
              title="HoneybeeTrips location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
              className="h-72 w-full border-0 sm:h-96"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
