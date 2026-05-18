import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How does HoneybeeTrips plan my itinerary?',
    a: 'We start with your dates, pace, and budget, then handcraft a route with vetted stays, transfers, and experiences. You review a clear day-wise plan before confirming anything.',
  },
  {
    q: 'Can I customize the packages shown on the site?',
    a: 'Yes. Every package is a starting point. You can swap hotels, add free days, adjust sightseeing, or plug in experiences like cruises and activities.',
  },
  {
    q: 'Do you handle visas and travel insurance?',
    a: 'We guide you with the latest visa requirements and documentation. For select destinations we can connect you with visa partners and insurance providers.',
  },
  {
    q: 'What support do I get during the trip?',
    a: 'You receive an on-trip assistance contact and WhatsApp support for changes, clarifications, and emergencies throughout your journey.',
  },
  {
    q: 'Is there a fee for planning?',
    a: 'Our planning fee is usually built into the package. For complex multi-country trips we may charge a transparent planning retainer that adjusts against the final booking.',
  },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState(0)

  const toggle = (idx) => {
    setOpenIndex((prev) => (prev === idx ? -1 : idx))
  }

  return (
    <section className="bg-neutral-50 py-14 sm:py-16" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">FAQ</p>
            <h2
              id="faq-heading"
              className="mt-2 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl"
            >
              Questions before you book
            </h2>
            <p className="mt-3 text-sm text-neutral-600">
              A few quick answers around how we plan, what&apos;s included, and the kind of support you can expect.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-4 text-sm text-amber-900 sm:px-5 sm:py-5 md:max-w-sm">
            <p className="font-semibold">Didn&apos;t find your question?</p>
            <p className="mt-1">
              Drop us a note with your dates and destination. We&apos;ll reply with a tailored plan, not a spammy
              newsletter.
            </p>
          </div>
        </div>

        <div className="mt-8 divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
          {faqs.map((item, idx) => {
            const open = openIndex === idx
            return (
              <button
                key={item.q}
                type="button"
                onClick={() => toggle(idx)}
                className="flex w-full flex-col items-stretch px-4 py-4 text-left sm:px-6 sm:py-5"
                aria-expanded={open}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-semibold text-honey">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-neutral-900 sm:text-base">{item.q}</p>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </div>
                {open && (
                  <p className="mt-3 pl-10 text-sm leading-relaxed text-neutral-600 sm:pl-11">{item.a}</p>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}

