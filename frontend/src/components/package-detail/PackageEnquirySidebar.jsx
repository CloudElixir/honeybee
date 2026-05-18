import { useState } from 'react'
import { Mail, MessageCircle, Phone, Share2, Star, User } from 'lucide-react'
import { formatInr } from './luxuryHelpers'

const NUM = 'font-sans tabular-nums tracking-tight'

const SIDEBAR_CARD =
  'rounded-2xl border-2 border-lux-gold/35 bg-white text-neutral-900 shadow-[0_12px_40px_-8px_rgba(244,196,0,0.18),0_4px_16px_-4px_rgba(0,0,0,0.06)]'

/**
 * Sticky package sidebar — hotel tier, price, quick enquiry (gold/white Honeybee style).
 * Sticks within the parent grid row; parent layout ends before "More adventures".
 */
export function PackageEnquirySidebar({
  tier,
  setTier,
  price,
  pkgTitle,
  openBooking,
  stickyTopClass = 'lg:top-28',
}) {
  return (
    <aside
      className={`lg:sticky ${stickyTopClass} lg:z-10 lg:self-start lg:h-fit lg:max-h-[calc(100vh-7.5rem)] lg:overflow-y-auto`}
    >
      <div className={`${SIDEBAR_CARD} p-6`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lux-gold">Select hotel type</p>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[3, 4, 5].map((s) => {
            const active = tier === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setTier(s)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-1 py-3 text-center transition ${
                  active
                    ? 'border-lux-gold bg-amber-50 text-lux-black shadow-[0_0_20px_-4px_rgba(244,196,0,0.45)]'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-lux-gold/40 hover:text-lux-black'
                }`}
              >
                <span className="flex justify-center gap-px">
                  {Array.from({ length: s }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${active ? 'fill-lux-gold text-lux-gold' : 'fill-none text-neutral-400'}`}
                      strokeWidth={active ? 0 : 1.5}
                      aria-hidden
                    />
                  ))}
                </span>
                <span className="text-[9px] font-bold uppercase leading-tight tracking-wide text-inherit">
                  {s} star
                </span>
              </button>
            )
          })}
        </div>
        <p className={`mt-8 text-4xl font-semibold text-lux-black ${NUM}`}>{formatInr(price)}</p>
        <p className="mt-1 text-xs font-medium text-neutral-600">Per person (taxes excluded)</p>
      </div>
      <div className={`${SIDEBAR_CARD} mt-5 p-6`}>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-lux-gold">Quick enquiry</p>
        <EnquiryMiniForm
          pkgTitle={pkgTitle}
          tier={tier}
          priceLabel={formatInr(price)}
          openBooking={openBooking}
        />
      </div>
      <button
        type="button"
        onClick={() => {
          const url = typeof window !== 'undefined' ? window.location.href : ''
          navigator.clipboard?.writeText(url).catch(() => {})
        }}
        className="mt-4 flex w-full items-center justify-center gap-2 text-xs font-semibold text-neutral-500 hover:text-lux-gold"
      >
        <Share2 className="h-3.5 w-3.5" />
        Share or copy package link
      </button>
    </aside>
  )
}

function EnquiryMiniForm({ pkgTitle, tier, priceLabel, openBooking }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [comment, setComment] = useState('')

  const fieldWrap = 'flex items-center gap-2 rounded-xl border border-lux-gold/30 bg-amber-50/70 px-3 py-2.5'
  const fieldWrapTextarea = 'flex gap-2 rounded-xl border border-lux-gold/30 bg-amber-50/70 px-3 py-2.5'
  const inputCls = 'w-full bg-transparent text-sm text-neutral-900 outline-none placeholder:text-neutral-500'

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(e) => {
        e.preventDefault()
        openBooking({
          destination: `${pkgTitle} (${tier}★)`,
          name,
          phone,
          budget: `${priceLabel} — ${email ? `${email} · ` : ''}${comment || 'Enquiry from package page'}`,
        })
      }}
    >
      <label className="block">
        <span className="sr-only">Full name</span>
        <span className={fieldWrap}>
          <User className="h-4 w-4 shrink-0 text-lux-gold" />
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputCls} />
        </span>
      </label>
      <label className="block">
        <span className="sr-only">Email</span>
        <span className={fieldWrap}>
          <Mail className="h-4 w-4 shrink-0 text-lux-gold" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            type="email"
            className={inputCls}
          />
        </span>
      </label>
      <label className="block">
        <span className="sr-only">Phone</span>
        <span className={fieldWrap}>
          <Phone className="h-4 w-4 shrink-0 text-lux-gold" />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className={inputCls}
          />
        </span>
      </label>
      <label className="block">
        <span className="sr-only">Comment</span>
        <span className={fieldWrapTextarea}>
          <MessageCircle className="mt-1 h-4 w-4 shrink-0 text-lux-gold" />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment"
            rows={3}
            className={inputCls + ' resize-none'}
          />
        </span>
      </label>
      <button
        type="submit"
        className="w-full rounded-xl bg-lux-gold py-3.5 text-sm font-bold uppercase tracking-wide text-lux-black shadow-lg shadow-lux-gold/45 transition hover:brightness-105"
      >
        Send enquiry
      </button>
      <p className="text-[10px] text-neutral-600">Opens the secure booking modal — add dates to submit.</p>
    </form>
  )
}
