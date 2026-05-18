/**
 * Policy blocks for destination package pages: Important Notes, Terms & Conditions, Cancellation.
 * Styled to match Honeybee (honey accent, neutral cards, rounded geometry).
 */

const IMPORTANT_NOTES_LEFT = [
  'Standard check-in time is usually 14:00 hrs and check-out is 12:00 hrs.',
  'Valid government photo ID is mandatory for all travelers at the time of check-in.',
  'Hotel rooms are typically provided on a twin-sharing basis unless otherwise specified.',
  'All timings mentioned in the itinerary are approximate and subject to change.',
  'Entrance fees to monuments and attractions are included unless mentioned otherwise.',
  'Travel insurance is highly recommended to cover unforeseen circumstances.',
  'Visa requirements and processing are the responsibility of the traveler unless specified.',
  'Baggage allowance is as per airline policy; excess baggage charges may apply.',
  'Senior citizens may require medical clearance for certain adventure activities.',
  'Tipping for guides, drivers, and hotel staff is customary and appreciated but not mandatory.',
]

const IMPORTANT_NOTES_RIGHT = [
  'Early check-in or late check-out is subject to hotel availability and may incur additional charges.',
  'Itinerary sequence may be adjusted based on local conditions, weather, or operational requirements.',
  'Triple occupancy rooms may have limited availability and could include a rollaway bed.',
  'Meals included are as per the itinerary; special dietary requirements should be informed in advance.',
  'Personal expenses such as laundry, telephone calls, and minibar are not included.',
  'Passport validity of at least 6 months from the date of travel is required for international packages.',
  'Flight timings are subject to change by the airline; please reconfirm before departure.',
  'Children below a certain age may be eligible for discounted rates; please check policy.',
  'Photography and videography may be restricted at certain locations.',
  'Get ready on time as per the itinerary timings.',
]

const TERMS_SECTIONS = [
  {
    title: 'Booking & Payment',
    items: [
      'Booking and payment must be made as per company policy.',
      'All rates are subject to change based on availability, taxes, fuel charges, and currency fluctuations, until full payment is received.',
    ],
  },
  {
    title: 'Traveller Documentation',
    items: [
      'For domestic travel, travellers must carry a valid government-issued photo ID as required by local regulations.',
      'For international travel, travellers must hold a valid passport (minimum six months validity from the date of travel) and all required visas and travel documents.',
      'The company may guide on documentation but is not responsible for denial of boarding, visa refusal, or any service denial due to incomplete or incorrect documents.',
    ],
  },
  {
    title: 'Itinerary & Services',
    items: [
      'The sequence or timing of sightseeing, transfers, or activities may be changed due to weather, traffic, operational, or safety reasons.',
      'If a service, attraction, or activity is unavailable, the company may provide a similar alternative of comparable value where possible.',
    ],
  },
  {
    title: 'Accommodation',
    items: [
      'Hotel bookings are subject to availability. If the selected hotel is not available, an alternate hotel of a similar category will be arranged.',
      'Check-in and check-out times are as per hotel policy and may vary by destination.',
    ],
  },
]

const CANCELLATION_DOMESTIC = [
  { heading: '30+ days before departure', body: 'Deposit only, or 10% of total package cost, whichever is higher. Balance is refundable.' },
  { heading: '30 to 15 days before departure', body: '30% of the total package cost.' },
  { heading: '15 to 7 days before departure', body: '60% of the total package cost.' },
  { heading: '7 to 3 days before departure', body: '90% of the total package cost.' },
  { heading: 'Less than 3 days / no show', body: '100% of the total package cost (no refund).' },
]

const CANCELLATION_INTERNATIONAL = [
  { heading: '45+ days before departure', body: 'Deposit only, or 10% of total package cost, whichever is higher.' },
  { heading: '45 to 30 days before departure', body: '30% of the total package cost.' },
  { heading: '30 to 15 days before departure', body: '60% of the total package cost.' },
  { heading: '15 to 3 days before departure', body: '90% of the total package cost.' },
  { heading: 'Less than 3 days / no show', body: '100% of the total package cost (no refund).' },
]

function BulletList({ items, bulletClass = 'bg-neutral-300' }) {
  return (
    <ul className="space-y-3">
      {items.map((text) => (
        <li key={text} className="flex gap-3 text-sm leading-relaxed text-neutral-700">
          <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${bulletClass}`} aria-hidden />
          <span>{text}</span>
        </li>
      ))}
    </ul>
  )
}

function PolicyCard({ children, className = '' }) {
  return (
    <div
      className={`rounded-[1.25rem] border border-neutral-200/90 bg-white p-6 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.12)] sm:p-8 md:p-10 ${className}`}
    >
      {children}
    </div>
  )
}

export function PackagePolicySections() {
  return (
    <div className="mt-12 space-y-12 rounded-3xl border border-neutral-200/60 bg-gradient-to-b from-neutral-50/90 to-amber-50/20 px-4 py-10 sm:px-6 sm:py-12">
      {/* Important Notes */}
      <section id="notes" className="scroll-mt-24">
        <div className="mb-6 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-900/75">Before you travel</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Important Notes
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Key guidelines to ensure a smooth travel experience
          </p>
        </div>
        <PolicyCard>
          <div className="grid gap-8 md:grid-cols-2 md:gap-12">
            <BulletList items={IMPORTANT_NOTES_LEFT} />
            <BulletList items={IMPORTANT_NOTES_RIGHT} />
          </div>
        </PolicyCard>
      </section>

      {/* Terms & Conditions */}
      <section id="tc" className="scroll-mt-24">
        <div className="mb-6 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-900/75">Legal</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Terms & <span className="text-amber-800">Conditions</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Applicable for both domestic and international travel packages
          </p>
        </div>
        <PolicyCard>
          <div className="space-y-8">
            {TERMS_SECTIONS.map((block) => (
              <div key={block.title}>
                <h3 className="font-display text-base font-semibold text-neutral-950">{block.title}</h3>
                <div className="mt-3">
                  <BulletList items={block.items} bulletClass="bg-honey/80" />
                </div>
              </div>
            ))}
          </div>
        </PolicyCard>
      </section>

      {/* Cancellation */}
      <section id="cancellation" className="scroll-mt-24">
        <div className="mb-6 text-center sm:text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-900/75">Refunds</p>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-neutral-950 sm:text-3xl">
            Cancellation <span className="text-honey-dark">Policy</span>
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Clear and transparent cancellation guidelines
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-honey/25 bg-white/90 p-5 shadow-[0_12px_40px_-20px_rgba(0,0,0,0.1)] sm:p-7 md:p-8">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            <div>
              <h3 className="border-b border-honey/20 pb-2 font-display text-sm font-semibold uppercase tracking-wider text-amber-900">
                Domestic packages
              </h3>
              <ul className="mt-5 space-y-4">
                {CANCELLATION_DOMESTIC.map((row) => (
                  <li
                    key={row.heading}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 sm:p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-honey-dark">{row.heading}</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-800">{row.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="border-b border-honey/20 pb-2 font-display text-sm font-semibold uppercase tracking-wider text-amber-900">
                International packages
              </h3>
              <ul className="mt-5 space-y-4">
                {CANCELLATION_INTERNATIONAL.map((row) => (
                  <li
                    key={row.heading}
                    className="rounded-2xl border border-neutral-100 bg-neutral-50/80 p-4 sm:p-5"
                  >
                    <p className="text-xs font-bold uppercase tracking-wide text-honey-dark">{row.heading}</p>
                    <p className="mt-2 text-sm leading-relaxed text-neutral-800">{row.body}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
