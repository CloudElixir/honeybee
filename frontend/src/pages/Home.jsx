import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Search } from 'lucide-react'
import { HomeAssistantBubble } from '../components/HomeAssistantBubble'
import { RecentlyBookedItineraries } from '../components/RecentlyBookedItineraries'
import { EuropeSpotlight } from '../components/EuropeSpotlight'
import { TravelStyleTrips } from '../components/TravelStyleTrips'
import { BrandTriptychBanner } from '../components/BrandTriptychBanner'
import { TrustAndReviewsSection } from '../components/TrustAndReviewsSection'
import { LuxuryEscapes } from '../components/LuxuryEscapes'
import { GroupDepartures } from '../components/GroupDepartures'
import { InspireLeadBand } from '../components/InspireLeadBand'
import { LoveFromTheGram } from '../components/LoveFromTheGram'
import { Faq } from '../components/Faq'
import { useSeo } from '../hooks/useSeo'
import { useBooking } from '../context/BookingContext'
import { useAdminSettings } from '../hooks/useAdminSettings'

export function Home() {
  const { settings: adminSettings } = useAdminSettings()
  useSeo({
    title: 'Luxury Travel & Curated Journeys',
    description:
      'Explore the world with HoneybeeTrips — bespoke itineraries, vetted partners, and concierge support.',
  })
  const { openBooking } = useBooking()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const heroTitle = adminSettings?.hero_title?.trim() || 'Travel designed like a private atelier.'
  const heroSubtitle =
    adminSettings?.hero_subtitle?.trim() ||
    'A distinct way to plan: fewer crowds, better pacing, and destination stories tailored to your style.'
  const heroButtonText = adminSettings?.hero_button_text?.trim()
  const heroButtonUrl = adminSettings?.hero_button_url?.trim()
  const heroBanner = adminSettings?.hero_banner?.trim()
  const featuredTitle = adminSettings?.featured_packages_title?.trim()
  const offersContent = adminSettings?.offers_content?.trim()
  const testimonialsContent = adminSettings?.testimonials_content?.trim()

  function handleHeroSearch(e) {
    e.preventDefault()
    const q = query.trim()
    if (q) navigate(`/destinations?q=${encodeURIComponent(q)}`)
    else navigate('/destinations')
  }

  return (
    <>
      <section className="relative min-h-[100dvh] overflow-hidden" aria-label="Hero">
        <div className="absolute inset-0">
          <motion.img
            src={
              heroBanner ||
              'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=85'
            }
            alt="Mountain road with dramatic skies"
            className="h-full w-full object-cover object-center"
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 14, ease: 'easeOut' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/85" />
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/25 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[100dvh] flex-col pb-28 pt-[5.5rem] sm:pb-32 sm:pt-24 md:pt-28">
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center sm:px-6">
            <motion.div
              className="max-w-4xl"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="font-sans text-[2rem] font-semibold leading-[1.15] tracking-tight text-white text-balance sm:text-4xl md:text-5xl lg:text-6xl xl:text-[3.5rem]">
                {heroTitle.split('\n').map((line, idx) => (
                  <span key={idx} className="block">
                    {line}
                  </span>
                ))}
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base md:text-lg">
                {heroSubtitle}
              </p>

              <form
                onSubmit={handleHeroSearch}
                className="mx-auto mt-8 w-full max-w-xl sm:mt-10"
              >
                <label htmlFor="hero-search" className="sr-only">
                  Find your perfect vacation
                </label>
                <div className="relative">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-honey"
                    aria-hidden
                  />
                  <input
                    id="hero-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search destination, mood, or trip type..."
                    className="w-full rounded-full border-2 border-honey/70 bg-black/35 py-3.5 pl-12 pr-4 text-sm text-white shadow-[0_0_32px_-4px_rgba(255,193,7,0.35)] backdrop-blur-md placeholder:text-white/55 focus:border-honey focus:outline-none focus:ring-2 focus:ring-honey/40 sm:py-4 sm:text-base"
                  />
                </div>
              </form>

              {heroButtonText && heroButtonUrl && (
                <div className="mt-6 flex justify-center">
                  <a
                    href={heroButtonUrl}
                    className="inline-flex items-center justify-center rounded-full bg-honey px-7 py-3 text-sm font-semibold text-neutral-900 shadow-lg shadow-amber-500/20 transition hover:bg-honey-dark"
                  >
                    {heroButtonText}
                  </a>
                </div>
              )}

            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 z-10 border-t border-honey/20 bg-black/80 px-3 py-3 backdrop-blur-md sm:px-6 sm:py-4">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] text-white/90 sm:justify-between sm:text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-honey font-bold text-neutral-900">
                  G
                </span>
                <span className="font-semibold">4.9</span>
                <span className="text-white/70">Google rating</span>
              </div>
              <span className="hidden h-4 w-px bg-white/20 sm:block" aria-hidden />
              <span className="font-medium">18,000+ travelers</span>
              <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden />
              <span className="font-medium">800+ itineraries</span>
              <span className="hidden h-4 w-px bg-white/20 lg:block" aria-hidden />
              <span className="flex items-center gap-1.5 text-white/85">
                <Sparkles className="h-4 w-4 text-honey" aria-hidden />
                <span className="font-semibold uppercase tracking-wider text-honey">Trip planner</span>
                <span className="text-white/70">— instant ideas</span>
              </span>
            </div>
          </div>

          <HomeAssistantBubble />
        </div>
      </section>

      <RecentlyBookedItineraries />

      <TrustAndReviewsSection />

      <LoveFromTheGram />

      {(offersContent || testimonialsContent) && (
        <section className="bg-neutral-950 py-12 sm:py-14">
          <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            {offersContent && (
              <article className="rounded-2xl border border-honey/25 bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-honey">Offers</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85">
                  {offersContent}
                </p>
              </article>
            )}
            {testimonialsContent && (
              <article className="rounded-2xl border border-white/15 bg-white/[0.03] p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-honey">Testimonials</p>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85">
                  {testimonialsContent}
                </p>
              </article>
            )}
          </div>
        </section>
      )}

      <EuropeSpotlight title={featuredTitle || undefined} />

      <TravelStyleTrips />

      <BrandTriptychBanner />

      <LuxuryEscapes />

      <GroupDepartures />

      <InspireLeadBand />

      <Faq />
    </>
  )
}
