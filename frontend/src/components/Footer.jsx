import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowUp,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MessageCircle,
  Phone,
  Youtube,
} from 'lucide-react'
import { fetchPublic, fetchSettingsMap } from '../api/adminPublic'
import {
  chunkFooterLinks,
  destinationSlug,
  footerCompanyLinks,
  footerDomesticDestinations,
  footerInternationalDestinations,
  footerPolicyLinks,
  footerThemedDestinations,
} from '../data/footerLinks'

const BRAND_STORY = `At HoneyBee Trips, we believe in the magic of travel. International holiday planning can be overwhelming — visas, flights, hotels, and day-by-day plans. We combine smart tools with human experts so you get a trip that feels personal, not generic. From honeymoons to family adventures, we handle the details while you focus on the memories.`

function FooterLinkColumn({ links }) {
  if (!links?.length) return null
  return (
    <ul className="space-y-2.5 text-sm text-white/70">
      {links.map((item) => (
        <li key={`${item.to}-${item.label}`}>
          <Link to={item.to} className="transition hover:text-honey">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}

function FooterLinkGrid({ title, columns }) {
  return (
    <div className="border-t border-white/10 py-10 sm:py-12">
      <h3 className="text-base font-semibold text-white sm:text-lg">{title}</h3>
      <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col, i) => (
          <FooterLinkColumn key={i} links={col} />
        ))}
      </div>
    </div>
  )
}

export function Footer() {
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [settings, setSettings] = useState({})
  const [extraDestinations, setExtraDestinations] = useState([])

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 320)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    let alive = true
    Promise.all([fetchSettingsMap(), fetchPublic('destinations')])
      .then(([map, rows]) => {
        if (!alive) return
        setSettings(map || {})
        const seen = new Set(
          footerInternationalDestinations.map((d) => d.label.toLowerCase())
        )
        const fromCms = (Array.isArray(rows) ? rows : [])
          .map((d) => {
            const name = String(d.name || d.title || '').trim()
            if (!name) return null
            const label = `${name} Holiday Packages`
            if (seen.has(label.toLowerCase())) return null
            seen.add(label.toLowerCase())
            const slug = String(d.slug || destinationSlug(name))
            return { label, to: `/destinations/${encodeURIComponent(slug)}` }
          })
          .filter(Boolean)
        setExtraDestinations(fromCms)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const internationalCols = useMemo(() => {
    const merged = [...footerInternationalDestinations, ...extraDestinations]
    return chunkFooterLinks(merged, 4)
  }, [extraDestinations])
  const themedCols = useMemo(() => chunkFooterLinks(footerThemedDestinations, 4), [])
  const domesticCols = useMemo(() => chunkFooterLinks(footerDomesticDestinations, 4), [])

  const email = settings.site_email || 'hello@honeybeetrips.com'
  const phone = settings.site_phone || '+91 98765 43210'
  const whatsapp = settings.whatsapp || settings.site_whatsapp || '919876543210'
  const waHref = `https://wa.me/${String(whatsapp).replace(/\D/g, '')}`
  const careersEmail = settings.careers_email || 'careers@honeybeetrips.com'

  const socialLinks = [
    { label: 'Facebook', href: settings.facebook || 'https://facebook.com', Icon: Facebook },
    { label: 'Instagram', href: settings.instagram || 'https://instagram.com', Icon: Instagram },
    { label: 'LinkedIn', href: settings.linkedin || 'https://linkedin.com', Icon: Linkedin },
    { label: 'YouTube', href: settings.youtube || 'https://youtube.com', Icon: Youtube },
  ]

  return (
    <footer className="relative z-20 mt-auto w-full bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 border-b border-white/10 py-12 sm:py-14 lg:flex-row lg:items-start lg:justify-between lg:gap-16">
          <p className="max-w-3xl text-sm leading-relaxed text-white/75 sm:text-[15px]">{BRAND_STORY}</p>
          <Link to="/" className="shrink-0 self-start lg:self-center">
            <span className="relative inline-flex flex-col items-center">
              <span
                className="pointer-events-none absolute -inset-8 opacity-60"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(circle at 20% 30%, rgba(56,189,248,0.35) 0 2px, transparent 3px), radial-gradient(circle at 70% 20%, rgba(244,114,182,0.35) 0 2px, transparent 3px), radial-gradient(circle at 85% 60%, rgba(250,204,21,0.4) 0 2px, transparent 3px), radial-gradient(circle at 30% 75%, rgba(56,189,248,0.3) 0 1.5px, transparent 2.5px)',
                }}
              />
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-honey text-2xl font-black text-neutral-900 shadow-lg shadow-amber-500/30">
                H
              </span>
              <span className="mt-3 font-display text-2xl font-bold tracking-tight text-white">
                HoneyBee Trips
              </span>
            </span>
          </Link>
        </div>

        <FooterLinkGrid title="International Holiday Destinations" columns={internationalCols} />
        <FooterLinkGrid title="Themed Destinations" columns={themedCols} />
        <FooterLinkGrid title="India Holiday Destinations" columns={domesticCols} />

        <div className="border-t border-white/10 py-10 sm:py-12">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <h4 className="text-base font-semibold text-white">HoneyBee Trips</h4>
              <ul className="mt-5 space-y-2.5 text-sm text-white/70">
                {footerCompanyLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition hover:text-honey">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">Policy</h4>
              <ul className="mt-5 space-y-2.5 text-sm text-white/70">
                {footerPolicyLinks.map((item) => (
                  <li key={item.label}>
                    <Link to={item.to} className="transition hover:text-honey">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">Talk to us</h4>
              <ul className="mt-5 space-y-3.5 text-sm text-white/70">
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                  <a href={`mailto:${email}`} className="transition hover:text-honey">
                    {email}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                  <a href={`tel:${phone.replace(/\s/g, '')}`} className="transition hover:text-honey">
                    {phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-honey"
                  >
                    WhatsApp
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-white/50" aria-hidden />
                  <a href={`mailto:${careersEmail}`} className="transition hover:text-honey">
                    {careersEmail}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-base font-semibold text-white">Social</h4>
              <ul className="mt-5 space-y-2.5 text-sm text-white/70">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 transition hover:text-honey"
                    >
                      <Icon className="h-4 w-4 text-white/50" aria-hidden />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-8 text-xs leading-relaxed text-white/45">
                HoneyBee Trips Global Pvt. Ltd. © {new Date().getFullYear()} All Rights Reserved.
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-center justify-end border-t border-white/10 pt-6">
            {showBackToTop && (
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white transition hover:bg-white/10"
                aria-label="Back to top"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
