import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  MapPin,
  Globe2,
  Check,
  Calendar,
  ChevronLeft,
  CalendarDays,
  Wallet,
  Sun,
  Clock3,
  Languages,
  Stamp,
  Building2,
  Users,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  ArrowRight,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, useRef, useCallback } from 'react'
import { getDestinationBySlug, getDestinationSlug } from '../data/destinations'
import { useSeo } from '../hooks/useSeo'
import { useBooking } from '../context/BookingContext'
import { Faq } from '../components/Faq'
import { BaliSerenityReviews } from '../components/BaliSerenityReviews'
import { PackagePolicySections } from '../components/PackagePolicySections'
import { fetchPackageHotels, fetchPackageItineraries, fetchPublic, mediaUrl } from '../api/adminPublic'
import { normalizeSlug as cmsPackageSlug } from '../components/package-detail/luxuryHelpers'

const splitAdminTextList = (value) =>
  String(value || '')
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)

const normalizeSectionKey = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()

const extractSectionBlock = (text, labels) => {
  const source = String(text || '')
  if (!source) return ''
  const normalizedLabels = labels.map((label) => normalizeSectionKey(label))
  const allKnown = ['important notes', 'terms', 'terms and conditions', 'faq', 'faqs']
  const headingRegex = /^\s*([A-Za-z][A-Za-z\s&/.-]{2,})\s*:\s*$/gm
  const matches = []
  let m
  while ((m = headingRegex.exec(source)) !== null) {
    matches.push({ key: normalizeSectionKey(m[1]), start: m.index, bodyStart: headingRegex.lastIndex })
  }
  const target = matches.find((item) => normalizedLabels.includes(item.key))
  if (!target) return ''
  const next = matches.find((item) => item.start > target.start && allKnown.includes(item.key))
  const end = next ? next.start : source.length
  return source.slice(target.bodyStart, end).trim()
}

const parseBulletedLines = (text) =>
  String(text || '')
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean)

const parseFaqPairs = (text) => {
  const cleaned = String(text || '').trim()
  if (!cleaned) return []
  const lines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const pairs = []
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const qa = line.match(/^q\s*[:|-]\s*(.+?)\s*(?:\|\s*a\s*[:|-]\s*(.+))?$/i)
    if (qa) {
      pairs.push({ q: qa[1].trim(), a: (qa[2] || '').trim() || 'Please contact us for details.' })
      continue
    }
    const inline = line.match(/^(.+?)\s*\?\s*(.+)$/)
    if (inline) {
      pairs.push({ q: `${inline[1].trim()}?`, a: inline[2].trim() })
      continue
    }
    const next = lines[i + 1]
    if (line.endsWith('?') && next) {
      pairs.push({ q: line, a: next })
      i += 1
    }
  }
  return pairs
}

const inferHotelTier = (hotel) => {
  const text = `${hotel?.name || ''} ${hotel?.location || ''} ${hotel?.notes || ''}`.toLowerCase()
  if (/(5\s*\*|5\s*-?\s*star|five\s*star)/.test(text)) return '5-star'
  if (/(4\s*\*|4\s*-?\s*star|four\s*star)/.test(text)) return '4-star'
  if (/(3\s*\*|3\s*-?\s*star|three\s*star)/.test(text)) return '3-star'
  return '3-star'
}

const mapAdminPackageToCard = (pkg, itineraryRows, hotelRows) => {
  const locations = splitAdminTextList(pkg.location)
  const highlights = splitAdminTextList(pkg.highlights)
  const itineraryDays = (Array.isArray(itineraryRows) ? itineraryRows : [])
    .map((row, idx) => ({
      day: Number(row.day_number || idx + 1),
      title: row.title || `Day ${idx + 1}`,
      text: row.description || '',
      image: row.image_path || '',
    }))
    .sort((a, b) => a.day - b.day)

  const hotels = Array.isArray(hotelRows) ? hotelRows : []
  const groupedHotels = { '3-star': [], '4-star': [], '5-star': [] }
  hotels.forEach((hotel) => {
    const tier = inferHotelTier(hotel)
    groupedHotels[tier].push({
      image:
        pkg.image_path ||
        pkg.cover_image ||
        'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
      title: hotel.name || 'Handpicked stay',
      subtitle: [hotel.location, hotel.notes].filter(Boolean).join(' • ') || 'Curated stay',
    })
  })

  const fallbackHotels = hotels.map((hotel) => ({
    image:
      pkg.image_path ||
      pkg.cover_image ||
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    title: hotel.name || 'Handpicked stay',
    subtitle: [hotel.location, hotel.notes].filter(Boolean).join(' • ') || 'Curated stay',
  }))

  const fullDesc = String(pkg.full_desc || '')
  const directImportantNotes = parseBulletedLines(String(pkg.important_notes || ''))
  const directTerms = parseBulletedLines(String(pkg.terms || ''))
  const directFaq = parseFaqPairs(String(pkg.faq || ''))
  const importantNotesBlock = extractSectionBlock(fullDesc, ['important notes'])
  const termsBlock = extractSectionBlock(fullDesc, ['terms', 'terms and conditions'])
  const faqBlock = extractSectionBlock(fullDesc, ['faq', 'faqs'])
  const parsedImportantNotes = parseBulletedLines(importantNotesBlock)
  const parsedTerms = parseBulletedLines(termsBlock)
  const parsedFaq = parseFaqPairs(faqBlock)

  return {
    id: pkg.slug || String(pkg.id),
    badge: String(pkg.category || 'curated').toLowerCase(),
    name: pkg.title || 'Package',
    durationLabel: pkg.duration || 'Custom duration',
    durationDays: itineraryDays.length || Number.parseInt(String(pkg.duration).match(/\d+/)?.[0] || '5', 10),
    from: Number(pkg.price || 0),
    image:
      mediaUrl(pkg.image_path) ||
      mediaUrl(pkg.cover_image) ||
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
    coverBullets: [
      locations.length > 0 ? `Covering: ${locations.join(' • ')}` : 'Curated experiences',
      'Curated experiences',
      'Seamless travel',
    ],
    themes: [],
    keywords: locations,
    tourHighlights: highlights.length > 0 ? highlights : [pkg.short_desc || 'Curated route highlights'],
    itineraryDays:
      itineraryDays.length > 0
        ? itineraryDays
        : [{ day: 1, title: 'Overview', text: pkg.short_desc || 'Package details available.' }],
    hotel: {
      title: 'Where you stay',
      text:
        hotels.length > 0
          ? `${hotels.length} curated hotel option(s) selected for this package.`
          : 'Hotel options available on request.',
    },
    packageInclusions: splitAdminTextList(pkg.inclusions),
    packageExclusions: splitAdminTextList(pkg.exclusions),
    importantNotes:
      directImportantNotes.length > 0
        ? directImportantNotes
        : parsedImportantNotes.length > 0
          ? parsedImportantNotes
        : ['Final hotel allocation depends on live availability.'],
    terms:
      directTerms.length > 0
        ? directTerms
        : parsedTerms.length > 0
          ? parsedTerms
        : ['Package confirmation is subject to availability and policy.'],
    faq:
      directFaq.length > 0
        ? directFaq
        : parsedFaq.length > 0
          ? parsedFaq
        : [
            {
              q: 'Can I customize this package?',
              a: 'Yes. Our team can tailor this package to your dates, hotel preference, and pace.',
            },
          ],
    stayOptions: {
      '3-star': groupedHotels['3-star'].length > 0 ? groupedHotels['3-star'] : fallbackHotels,
      '4-star': groupedHotels['4-star'].length > 0 ? groupedHotels['4-star'] : fallbackHotels,
      '5-star': groupedHotels['5-star'].length > 0 ? groupedHotels['5-star'] : fallbackHotels,
    },
    cmsPackage: true,
    packageSlug: cmsPackageSlug(String(pkg.slug || pkg.title || pkg.id)),
  }
}

const baliPackageCards = [
  {
    id: 'bali-nusa-penida',
    badge: 'curated',
    name: 'Bali and Nusa Penida',
    durationLabel: '5D / 4N',
    durationDays: 5,
    from: 29000,
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200&q=80',
    coverBullets: ['Covering: Ubud • Kuta • Nusa Penida', 'Curated experiences', 'Seamless travel'],
    themes: ['leisure', 'honeymoon'],
    keywords: ['bali', 'ubud', 'nusa penida', 'kintamani', 'temple', 'seaside'],
    tourHighlights: ['Private transfers and local support', 'Ubud art villages + rice terrace viewpoints', 'Full-day Nusa Penida west coast tour', 'Sunset temple experience'],
    itineraryDays: [
      { day: 1, title: 'Arrive in Bali', text: 'Airport pickup, hotel check-in, and an easy sunset orientation around your neighborhood.' },
      { day: 2, title: 'Ubud + Kintamani views', text: 'Rice terraces, art stops, and a scenic Kintamani viewpoint with comfortable pacing.' },
      { day: 3, title: 'Nusa Penida day trip', text: 'A full-day Penida itinerary for the best viewpoints, designed to avoid the rush at key stops.' },
      { day: 4, title: 'Uluwatu temple + coastal time', text: 'Cliffside temple moments and relaxed beach time, plus smooth transfers back to your stay.' },
      { day: 5, title: 'Departure', text: 'Breakfast and drop to the airport. Keep your schedule flexible for the end-of-trip surprises.' },
    ],
    hotel: { title: 'Where you stay', text: '4 nights in a curated Bali stay (Ubud or Seminyak area depending on availability). Upgrades are available on request.' },
    packageInclusions: ['04 nights accommodation with breakfast', 'Airport pickup and drop with private vehicle', 'Full-day Nusa Penida tour (shared boat)', 'Kintamani + Ubud sightseeing with driver', 'English-speaking local assistance', 'All toll, parking, and driver allowances'],
    packageExclusions: ['International and domestic airfare', 'Visa fees and travel insurance', 'Personal expenses, tips, and shopping', 'Water sports and optional activities', 'Lunches and dinners unless specified', 'Anything not listed in inclusions'],
    importantNotes: ['Rates may change during peak dates and long weekends.', 'Penida day trip schedules can shift with weather.', 'Bring a valid government-issued photo ID.', 'Check-in/out times follow the hotel policy.'],
    terms: ['A valid photo ID is mandatory for all guests.', 'Package confirmation depends on hotel/transport availability.', 'Similar category hotels may be used if listed hotels sell out.', 'All disputes are handled as per company policy.'],
    faq: [
      { q: 'Is the Nusa Penida tour shared or private?', a: 'The boat is shared in most cases; we keep transfers and your itinerary organized for a smooth experience.' },
      { q: 'What if the weather affects Penida?', a: 'We’ll coordinate a safe alternative or adjust the sequence where possible, depending on on-ground conditions.' },
      { q: 'Can I request a hotel upgrade?', a: 'Yes. If your preferred property is available, we’ll upgrade or recommend the closest option.' },
      { q: 'Is pickup included?', a: 'Yes, airport pickup and drop are included with private vehicle as per your itinerary tier.' },
    ],
  },
  {
    id: 'mystical-bali-adventure',
    badge: 'trending',
    name: 'Mystical Bali Adventure',
    durationLabel: '5D / 4N',
    durationDays: 5,
    from: 32500,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200&q=80',
    coverBullets: ['Covering: Ubud • Kuta • Nusa Penida • Ayung', 'Curated experiences', 'Seamless travel'],
    themes: ['adventure'],
    keywords: ['bali', 'ubud', 'uluwatu', 'water sports', 'adventure', 'temple'],
    tourHighlights: ['Curated adventure pacing', 'Uluwatu sunset + coastal viewpoints', 'A waterscape day (combo) with guidance', 'Handpicked stops to keep the day smooth'],
    itineraryDays: [
      { day: 1, title: 'Arrival + beach unwind', text: 'Check-in, easy coastal orientation, and a relaxed start to your adventure.' },
      { day: 2, title: 'Ubud culture day', text: 'Art villages, scenic viewpoints, and curated local experiences at a comfortable pace.' },
      { day: 3, title: 'Water sports combo', text: 'A guided water day with safety-first coordination and smooth transfers.' },
      { day: 4, title: 'Uluwatu sunset', text: 'Cliffside temple moments and golden hour, followed by a calm return to your stay.' },
      { day: 5, title: 'Departure', text: 'Breakfast and drop. We’ll share a quick packing checklist for the next leg.' },
    ],
    hotel: { title: 'Where you stay', text: '4 nights in a curated stay zone (Ubud/Kuta mix). We optimize based on your schedule and comfort preferences.' },
    packageInclusions: ['04 nights accommodation with breakfast', 'Airport pickup and drop with private vehicle', 'Uluwatu sunset experience with transfers', 'Ubud sightseeing with driver', 'Local guidance and planning support', 'All toll, parking, and driver allowances'],
    packageExclusions: ['International and domestic airfare', 'Visa fees and travel insurance', 'Personal expenses, tips, and shopping', 'Any optional add-ons not listed', 'Lunches and dinners unless specified', 'Anything not listed in inclusions'],
    importantNotes: ['Adventure activities depend on weather and operator schedules.', 'Wear comfortable clothes and secure footwear for water + viewpoints.', 'We can adjust the sequence to keep the day balanced.', 'Hotel check-in/out times follow property policies.'],
    terms: ['A valid government-issued photo ID is mandatory for all guests.', 'Package confirmation is subject to hotel and transport availability.', 'Similar category hotels may be provided when listed hotels are sold out.', 'All disputes are subject to jurisdiction as per company policy.'],
    faq: [
      { q: 'Is the water sports activity included?', a: 'Yes, the selected combo is included. The final schedule depends on weather and operator timing.' },
      { q: 'Do I need any prior experience?', a: 'No — our plan includes guidance and we tailor the activity pacing to your comfort level.' },
      { q: 'Can you shift dates if my flight changes?', a: 'We’ll coordinate alternatives quickly to preserve the trip flow as much as possible.' },
      { q: 'Is there support during the trip?', a: 'Yes. You’ll have on-trip support for questions, coordination, and changes.' },
    ],
  },
  {
    id: 'mount-batur-sunrise',
    badge: 'underrated',
    name: 'Mount Batur Sunrise Trekking',
    durationLabel: '6D / 5N',
    durationDays: 6,
    from: 32500,
    image: 'https://images.unsplash.com/photo-1505218462031-74c5d3d2f8b3?w=1200&q=80',
    coverBullets: ['Covering: Ubud • Kintamani • Bali villages', 'Curated experiences', 'Seamless travel'],
    themes: ['adventure', 'leisure'],
    keywords: ['batur', 'sunrise', 'kintamani', 'hike', 'ubud', 'culture'],
    tourHighlights: ['Early sunrise trekking with comfortable pacing', 'Kintamani viewpoints and scenic stops', 'Optional hot-spring relax (if available)', 'Curated village experiences and transfers'],
    itineraryDays: [
      { day: 1, title: 'Arrive + village settle', text: 'Pickup, check-in, and a calm evening to help you adjust before the trek.' },
      { day: 2, title: 'Batur sunrise trek', text: 'Sunrise trek coordination, safe pacing, and a guided return for breakfast.' },
      { day: 3, title: 'Ubud + terraces', text: 'Rice terraces, art moments, and flexible timing for the best photos.' },
      { day: 4, title: 'Waterfalls and relax', text: 'A curated day for waterfalls + downtime, optimized for traffic and comfort.' },
      { day: 5, title: 'Local experiences', text: 'Coffee, temples, and cultural storytelling with a smooth, unhurried schedule.' },
      { day: 6, title: 'Departure', text: 'Breakfast and drop to the airport. We’ll recommend a final souvenir stop.' },
    ],
    hotel: { title: 'Where you stay', text: '5 nights in a curated Bali stay close to your daily route (Ubud/Kintamani access). Hotel category based on your tier.' },
    packageInclusions: ['05 nights accommodation with breakfast', 'Airport pickup and drop with private vehicle', 'Mount Batur sunrise trekking coordination', 'Kintamani + Ubud sightseeing with driver', 'English-speaking local assistance', 'All toll, parking, and driver allowances'],
    packageExclusions: ['International and domestic airfare', 'Visa fees and travel insurance', 'Personal expenses, tips, and shopping', 'Any optional activities not listed', 'Lunches and dinners unless specified', 'Anything not listed in inclusions'],
    importantNotes: ['Sunrise trek schedule can change due to weather and trail conditions.', 'Bring layers — early mornings are cooler.', 'Hotel check-in/out follows property policy.', 'Trek difficulty is moderate; we’ll brief you before the start.'],
    terms: ['A valid photo ID is mandatory for all guests.', 'Trip logistics depend on tour operator availability.', 'Similar category hotels may be used when listed options are unavailable.', 'All disputes are handled as per company policy.'],
    faq: [
      { q: 'Is the trek difficult?', a: 'The route is suitable for most travelers with moderate fitness. We coordinate safe pacing and breaks.' },
      { q: 'Will you arrange a guide?', a: 'Yes — trekking coordination and support are included according to the selected tier.' },
      { q: 'What about weather changes?', a: 'We adjust timing and alternatives when necessary for safety.' },
      { q: 'Is hot-spring time included?', a: 'If available for your schedule, we can add hot-spring relax as an optional extension.' },
    ],
  },
  {
    id: 'bali-desa-swing',
    badge: 'trending',
    name: 'Bali Desa Swing',
    durationLabel: '6D / 5N',
    durationDays: 6,
    from: 33500,
    image: 'https://images.unsplash.com/photo-1526481280695-3c687fd5432c?w=1200&q=80',
    coverBullets: ['Covering: Ubud • Jatiluwih • Uluwatu', 'Curated experiences', 'Seamless travel'],
    themes: ['honeymoon', 'leisure'],
    keywords: ['bali', 'swing', 'jatiluwih', 'villages', 'rice terrace', 'romantic'],
    tourHighlights: ['Jatiluwih rice terrace moments', 'Desa swing + golden hour photos', 'Temple storytelling and cultural stops', 'Comfort-paced beach + café time'],
    itineraryDays: [
      { day: 1, title: 'Arrival + welcome dinner', text: 'Pickup and check-in with a relaxed first evening to settle in.' },
      { day: 2, title: 'Jatiluwih terraces + temples', text: 'Scenic terraced landscapes and curated temple moments with smooth timing.' },
      { day: 3, title: 'Desa swing + village stroll', text: 'Desa swing experience and village exploration, designed for iconic photos without rushing.' },
      { day: 4, title: 'Uluwatu sunset', text: 'Cliffside temple + sunset time with comfortable transfers back to your stay.' },
      { day: 5, title: 'Coastline day', text: 'Beach time, cafés, and optional relax — tailored to your vibe.' },
      { day: 6, title: 'Departure', text: 'Breakfast and drop to the airport. We’ll share a final packing + souvenir checklist.' },
    ],
    hotel: { title: 'Where you stay', text: '5 nights in a curated Bali stay zone (Ubud/Canggu depending on availability). We optimize for the smoothest daily flow.' },
    packageInclusions: ['05 nights accommodation with breakfast', 'Airport pickup and drop with private vehicle', 'Jatiluwih + Ubud sightseeing with driver', 'Desa swing experience coordination', 'English-speaking local assistance', 'All toll, parking, and driver allowances'],
    packageExclusions: ['International and domestic airfare', 'Visa fees and travel insurance', 'Personal expenses, tips, and shopping', 'Optional add-ons not listed', 'Lunches and dinners unless specified', 'Anything not listed in inclusions'],
    importantNotes: ['Swing/photo timing can vary depending on weather and venue availability.', 'We recommend comfortable footwear and layers for morning/late afternoon.', 'Hotel check-in/out times follow property policies.', 'Rates can change for peak season and long weekends.'],
    terms: ['A valid photo ID is mandatory for all guests.', 'Package confirmation depends on hotel/transport availability.', 'Similar category hotels may be provided when listed options are sold out.', 'All disputes are subject to jurisdiction as per company policy.'],
    faq: [
      { q: 'Is the swing included?', a: 'Yes — the coordinated swing experience is included in this route tier.' },
      { q: 'Do I need to pay extra for photos?', a: 'Optional photos are typically available onsite; we include the coordinated experience in the package.' },
      { q: 'Is this suitable for honeymoon couples?', a: 'Yes. The route is balanced for romance, culture, and relaxed comfort pacing.' },
      { q: 'Can you adjust hotel location?', a: 'We can recommend and adjust based on availability and your travel flow.' },
    ],
  },
]

const baliHighlights = [
  'Private airport transfers and local support',
  'Ubud art villages and rice terrace viewpoints',
  'Full-day Nusa Penida west coast tour',
  'Temple trail with cultural storytelling',
  'Leisure time for beaches, cafes, and shopping',
]

const baliInclusions = [
  '04 nights accommodation with breakfast',
  'Airport pickup and drop with private vehicle',
  'Full-day Nusa Penida tour (shared boat)',
  'Kintamani + Ubud sightseeing with driver',
  'English-speaking local assistance',
  'All toll, parking, and driver allowances',
]

const baliExclusions = [
  'International and domestic airfare',
  'Visa fees and travel insurance',
  'Personal expenses, tips, and shopping',
  'Water sports and optional activities',
  'Lunches and dinners unless specified',
  'Anything not listed in inclusions',
]

const replaceBaliText = (text, destinationTitle, destinationCountry) =>
  String(text)
    .replaceAll('Bali', destinationTitle)
    .replaceAll('bali', destinationTitle.toLowerCase())
    .replaceAll('Indonesia', destinationCountry)
    .replaceAll('indonesia', destinationCountry.toLowerCase())

const toSlug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function createDestinationPackageCards(destination, displayName = destination.title) {
  const destinationSlug = getDestinationSlug(destination) || destination.id
  return baliPackageCards.map((pkg) => ({
    ...pkg,
    name: replaceBaliText(pkg.name, displayName, destination.location),
    id: `${destinationSlug}-${toSlug(replaceBaliText(pkg.name, displayName, destination.location))}`,
    keywords: [
      ...(pkg.keywords ?? []).filter((k) => k.toLowerCase() !== 'bali'),
      displayName.toLowerCase(),
      destination.location.toLowerCase(),
    ],
    coverBullets: (pkg.coverBullets ?? []).map((line) =>
      replaceBaliText(line, displayName, destination.location)
    ),
    tourHighlights: (pkg.tourHighlights ?? []).map((line) =>
      replaceBaliText(line, displayName, destination.location)
    ),
    itineraryDays: (pkg.itineraryDays ?? []).map((day) => ({
      ...day,
      title: replaceBaliText(day.title, displayName, destination.location),
      text: replaceBaliText(day.text, displayName, destination.location),
    })),
    hotel: pkg.hotel
      ? {
          ...pkg.hotel,
          text: replaceBaliText(pkg.hotel.text, displayName, destination.location),
        }
      : pkg.hotel,
    packageInclusions: (pkg.packageInclusions ?? []).map((line) =>
      replaceBaliText(line, displayName, destination.location)
    ),
    packageExclusions: (pkg.packageExclusions ?? []).map((line) =>
      replaceBaliText(line, displayName, destination.location)
    ),
    importantNotes: (pkg.importantNotes ?? []).map((line) =>
      replaceBaliText(line, displayName, destination.location)
    ),
    terms: (pkg.terms ?? []).map((line) => replaceBaliText(line, displayName, destination.location)),
    faq: (pkg.faq ?? []).map((item) => ({
      q: replaceBaliText(item.q, displayName, destination.location),
      a: replaceBaliText(item.a, displayName, destination.location),
    })),
    cmsPackage: false,
    packageSlug: null,
  }))
}

function DestinationPage({ d, openBooking }) {
  const destinationLabel = d.title
  const destinationCountry = d.location
  const [adminDestinationPackages, setAdminDestinationPackages] = useState([])
  const destinationPackageCards = useMemo(() => {
    if (adminDestinationPackages.length > 0) return adminDestinationPackages
    return createDestinationPackageCards(d, destinationLabel)
  }, [adminDestinationPackages, d, destinationLabel])
  const [openDays, setOpenDays] = useState([1])
  const allExpanded = openDays.length === d.itinerary.length
  const [packageQuery, setPackageQuery] = useState('')
  const [budget, setBudget] = useState('all')
  const [duration, setDuration] = useState('all')
  const [theme, setTheme] = useState('all')
  const [sortBy, setSortBy] = useState('relevance')
  const [aboutTab, setAboutTab] = useState('facts')
  const [aboutExpanded, setAboutExpanded] = useState(false)
  const [activePackage, setActivePackage] = useState(null)
  const [openItineraryDay, setOpenItineraryDay] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)
  const navigate = useNavigate()
  const destinationSlug = getDestinationSlug(d) || d.id
  /** Bottom marketing blocks removed for Bali Serenity page (aliases: /destinations/bali, etc.). */
  const hideBaliStaticPlanSections = d.id === 'bali-serenity'

  const goToPackageDetail = (pkg) => {
    if (pkg.cmsPackage && pkg.packageSlug) {
      navigate(`/packages/${pkg.packageSlug}`)
      return
    }
    navigate(`/destinations/${destinationSlug}/packages/${pkg.id}`, {
      state: { headerDestinationName: destinationLabel },
    })
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const packages = await fetchPublic('packages')
        if (!alive) return
        const targetTokens = [destinationLabel, destinationCountry, d.id]
          .map((token) => String(token || '').toLowerCase().trim())
          .filter(Boolean)
        const matchedPackages = (Array.isArray(packages) ? packages : []).filter((item) => {
          const hay = `${item.title || ''} ${item.location || ''} ${item.short_desc || ''}`.toLowerCase()
          return targetTokens.some((token) => hay.includes(token))
        })
        if (matchedPackages.length === 0) {
          setAdminDestinationPackages([])
          return
        }
        const ids = matchedPackages.map((pkg) => pkg.id).filter(Boolean)
        const [itineraryRows, hotelRows] = await Promise.all([
          fetchPackageItineraries(ids),
          fetchPackageHotels(ids),
        ])
        if (!alive) return

        const itinerariesByPackage = {}
        ;(Array.isArray(itineraryRows) ? itineraryRows : []).forEach((row) => {
          const key = String(row.package_id)
          if (!itinerariesByPackage[key]) itinerariesByPackage[key] = []
          itinerariesByPackage[key].push(row)
        })
        const hotelsByPackage = {}
        ;(Array.isArray(hotelRows) ? hotelRows : []).forEach((row) => {
          const key = String(row.package_id)
          if (!hotelsByPackage[key]) hotelsByPackage[key] = []
          hotelsByPackage[key].push(row)
        })

        const mappedCards = matchedPackages.map((pkg) =>
          mapAdminPackageToCard(
            pkg,
            itinerariesByPackage[String(pkg.id)] || [],
            hotelsByPackage[String(pkg.id)] || []
          )
        )

        setAdminDestinationPackages(mappedCards)
      } catch {
        if (!alive) return
        setAdminDestinationPackages([])
      }
    })()
    return () => {
      alive = false
    }
  }, [d.id, destinationCountry, destinationLabel])

  useEffect(() => {
    if (!activePackage) return undefined

    setOpenItineraryDay(null)
    setOpenFaqIndex(null)

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActivePackage(null)
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activePackage])

  const toggleDay = (day) => {
    setOpenDays((prev) => (prev.includes(day) ? prev.filter((dnum) => dnum !== day) : [...prev, day]))
  }

  const toggleAllDays = () => {
    setOpenDays(allExpanded ? [] : d.itinerary.map((day) => day.day))
  }

  const budgetOptions = [
    { value: 'all', label: 'All Budgets' },
    { value: '0-30000', label: 'Under ₹30,000' },
    { value: '30000-34000', label: '₹30,000 – ₹34,000' },
    { value: '34000-50000', label: '₹34,000+' },
  ]

  const durationOptions = [
    { value: 'all', label: 'All Durations' },
    { value: '5', label: '5D / 4N' },
    { value: '6', label: '6D / 5N' },
  ]

  const themeOptions = [
    { value: 'all', label: 'All Themes' },
    { value: 'leisure', label: 'Leisure' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'luxury', label: 'Luxury' },
    { value: 'honeymoon', label: 'Honeymoon' },
  ]

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price-asc', label: 'Price: Low to High' },
    { value: 'price-desc', label: 'Price: High to Low' },
    { value: 'duration-asc', label: 'Duration: Short to Long' },
    { value: 'duration-desc', label: 'Duration: Long to Short' },
  ]

  const parseDays = (durationText) => {
    const n = Number.parseInt(String(durationText).match(/\d+/)?.[0] ?? '0', 10)
    return Number.isFinite(n) ? n : 0
  }

  const parseBudget = (value) => {
    if (value === 'all') return null
    const [minS, maxS] = value.split('-')
    const min = Number(minS)
    const max = maxS ? Number(maxS) : Number.POSITIVE_INFINITY
    return { min: Number.isFinite(min) ? min : 0, max: Number.isFinite(max) ? max : Number.POSITIVE_INFINITY }
  }

  const resetFilters = () => {
    setPackageQuery('')
    setBudget('all')
    setDuration('all')
    setTheme('all')
    setSortBy('relevance')
  }

  const filteredPackages = (() => {
    const q = packageQuery.trim().toLowerCase()
    const b = parseBudget(budget)
    const dFilter = duration === 'all' ? null : Number(duration)

    let list = destinationPackageCards.filter((pkg) => {
      if (q) {
        const hay = `${pkg.name} ${pkg.keywords?.join(' ') ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }

      if (b && !(pkg.from >= b.min && pkg.from < b.max)) return false

      if (dFilter && pkg.durationDays !== dFilter) return false

      if (theme !== 'all') {
        if (!pkg.themes?.includes(theme)) return false
      }

      return true
    })

    if (sortBy === 'price-asc') list = [...list].sort((a, b2) => a.from - b2.from)
    if (sortBy === 'price-desc') list = [...list].sort((a, b2) => b2.from - a.from)
    if (sortBy === 'duration-asc') list = [...list].sort((a, b2) => a.durationDays - b2.durationDays)
    if (sortBy === 'duration-desc') list = [...list].sort((a, b2) => b2.durationDays - a.durationDays)

    return list
  })()

  const HONEYBEE_PICKS_MAX = 6
  const honeybeePicksPackages = filteredPackages.slice(0, HONEYBEE_PICKS_MAX)

  const aboutDestination = {
    titleKicker: 'Destination overview',
    title: `About ${destinationLabel}`,
    subtitle: d.shortDescription,
    body: [
      `${destinationLabel} in ${destinationCountry} offers curated routes with local highlights, flexible pacing, and comfort-first planning.`,
      `Choose from signature experiences, guided day plans, and customizable add-ons to make your ${destinationLabel} trip fit your travel style.`,
    ],
    facts: [
      { label: 'Destination', value: destinationCountry, icon: MapPin },
      { label: 'Region', value: d.region, icon: Globe2 },
      { label: 'Starting from', value: `$${d.priceFrom.toLocaleString()}`, icon: Wallet },
      { label: 'Duration', value: d.duration, icon: CalendarDays },
      { label: 'Trip style', value: d.budget, icon: Sun },
      { label: 'Language', value: 'Local + English support', icon: Languages },
      { label: 'Visa', value: 'As per nationality', icon: Stamp },
      { label: 'Group type', value: 'Couples / Family / Friends', icon: Users },
    ],
    why: d.highlights?.length ? d.highlights : ['Curated highlights for this destination.'],
  }

  const destinationBlogs = [
    {
      tag: 'Planning',
      readMins: 6,
      title: `Best time to visit ${destinationLabel} (and what to pack)`,
      excerpt:
        'Dry season vs shoulder months, crowd levels, and a simple packing list for beach days + temple visits.',
    },
    {
      tag: 'Itinerary',
      readMins: 7,
      title: 'Ubud vs Seminyak vs Uluwatu: where should you stay?',
      excerpt:
        'A quick neighborhood guide to match your vibe—cafés and culture, beach clubs, surf cliffs, or slow villas.',
    },
    {
      tag: 'Experiences',
      readMins: 5,
      title: 'Nusa Penida day trip: the route that saves time',
      excerpt:
        'How to avoid the busiest photo stops, pick the right beaches, and still make it back for sunset dinner.',
    },
    {
      tag: 'Food',
      readMins: 4,
      title: `${destinationLabel} food guide: what to try (and where)`,
      excerpt:
        'From nasi goreng to beachside seafood—plus café picks in Ubud and late-night bites in Seminyak.',
    },
    {
      tag: 'Budget',
      readMins: 6,
      title: `${destinationLabel} on a budget: upgrades that matter`,
      excerpt:
        'Where to spend (private transfers, villa nights) and where to save (day tours, local eats) for max value.',
    },
  ]

  const moreLikeScrollRef = useRef(null)
  const scrollMoreLike = useCallback((dir) => {
    const el = moreLikeScrollRef.current
    if (!el) return
    const card = el.querySelector('[data-more-like-card]')
    const gap = 24
    const step = (card?.getBoundingClientRect().width ?? 300) + gap
    el.scrollBy({ left: dir * step, behavior: 'smooth' })
  }, [])

  const heroStats = useMemo(() => {
    const packageCount = destinationPackageCards.length
    const activityCount =
      (d.highlights?.length ?? 0) + (d.itinerary?.length ?? 0) + (d.included?.length ?? 0)
    return [
      {
        value: packageCount > 0 ? `${packageCount}+` : '12+',
        label: 'Packages',
        color: 'text-sky-300',
      },
      {
        value: d.id === 'bali-serenity' ? '20k' : '8k',
        label: 'Travelers',
        color: 'text-honey',
      },
      {
        value: '4.9',
        label: 'Rating',
        color: 'text-emerald-300',
      },
      {
        value: `${Math.max(activityCount, 12)}+`,
        label: 'Activities',
        color: 'text-violet-300',
      },
    ]
  }, [destinationPackageCards.length, d.highlights, d.id, d.included, d.itinerary])

  const heroDescription =
    d.shortDescription ||
    `Handpicked ${destinationLabel} routes with smooth transfers, curated stays, and experiences paced for real rest—not rushed sightseeing.`

  const renderYouMightAlsoLikeCard = (pkg) => (
    <article
      key={`also-${pkg.id}`}
      data-more-like-card
      className="w-[min(320px,calc(100vw-2rem))] shrink-0 snap-start overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm"
    >
      <img src={pkg.image} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
      <div className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold text-neutral-900">{pkg.name}</h3>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
            {pkg.durationLabel}
          </span>
        </div>
        <p className="mt-2 text-2xl font-semibold text-neutral-900">
          ₹{pkg.from.toLocaleString()}
          <span className="text-sm font-normal text-neutral-500"> from / person</span>
        </p>
        <ul className="mt-4 space-y-2 text-sm text-neutral-600">
          {pkg.coverBullets?.map((point) => (
            <li key={point} className="flex gap-2">
              <span className="text-sky-600">•</span>
              {point}
            </li>
          ))}
        </ul>
        {pkg.cmsPackage && pkg.packageSlug ? (
          <Link
            to={`/packages/${pkg.packageSlug}`}
            className="mt-5 flex w-full items-center justify-center rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
          >
            View package details
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setActivePackage(pkg)}
            className="mt-5 w-full rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
          >
            Request this package
          </button>
        )}
      </div>
    </article>
  )

  return (
    <article>
      <section className="relative -mt-20 flex min-h-[min(92vh,880px)] flex-col overflow-hidden pt-20 sm:-mt-24 sm:min-h-[min(88vh,920px)] sm:pt-24">
        <img
          src={d.banner || d.image}
          alt=""
          className="absolute inset-0 h-full w-full scale-105 object-cover object-center"
          fetchpriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/55 to-black/80" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,transparent_0%,rgba(0,0,0,0.45)_100%)]"
          aria-hidden
        />
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 pb-28 pt-8 text-center sm:px-6"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
            <MapPin className="h-3.5 w-3.5 text-honey" strokeWidth={2.25} aria-hidden />
            {destinationLabel}
          </span>
          <h1 className="mt-5 font-display text-5xl font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
            {destinationLabel.split(' ')[0]}
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base md:text-lg">
            {heroDescription}
          </p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="mt-10 grid w-full max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4 sm:gap-4"
          >
            {heroStats.map((stat) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.08 }}
              >
                <p className={`font-display text-3xl font-bold sm:text-4xl ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 sm:text-[11px]">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mx-auto flex w-full max-w-7xl items-end justify-between gap-4 px-4 pb-8 sm:px-6 lg:px-8"
        >
          <nav className="flex items-center gap-2 text-sm text-white/75" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>
            <span className="text-white/40" aria-hidden>
              {' > '}
            </span>
            <Link to="/packages" className="transition hover:text-white">
              Packages
            </Link>
            <span className="text-white/40" aria-hidden>
              {' > '}
            </span>
            <span className="font-semibold text-white">{destinationSlug}</span>
          </nav>
          <a
            href="#packages"
            className="hidden text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:text-honey sm:block"
          >
            Explore
          </a>
        </motion.div>

        <a
          href="#packages"
          className="absolute bottom-20 left-1/2 z-10 -translate-x-1/2 text-[10px] font-semibold uppercase tracking-[0.28em] text-white/70 transition hover:text-honey sm:hidden"
        >
          Explore
        </a>
      </section>

      <section id="packages" className="scroll-mt-24 bg-neutral-50 pb-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="sticky top-24 z-30 -mt-6 sm:-mt-8">
            <div className="rounded-2xl border border-neutral-200 bg-white/95 shadow-lg backdrop-blur">
              <div className="flex flex-wrap items-center gap-2 p-3 sm:gap-3 sm:p-4">
                <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl bg-neutral-950 px-3 py-2 text-white">
                  <Search className="h-4 w-4 text-honey" aria-hidden />
                  <input
                    value={packageQuery}
                    onChange={(e) => setPackageQuery(e.target.value)}
                    placeholder="Search package"
                    className="w-full bg-transparent text-sm placeholder:text-white/55 focus:outline-none"
                    aria-label="Search package"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                    <Wallet className="h-4 w-4 text-neutral-700" aria-hidden />
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Budget
                    </div>
                    <select
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="bg-transparent text-sm font-medium text-neutral-900 focus:outline-none"
                      aria-label="Budget"
                    >
                      {budgetOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                    <Clock3 className="h-4 w-4 text-neutral-700" aria-hidden />
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Duration
                    </div>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="bg-transparent text-sm font-medium text-neutral-900 focus:outline-none"
                      aria-label="Duration"
                    >
                      {durationOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                    <Sun className="h-4 w-4 text-neutral-700" aria-hidden />
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Theme
                    </div>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      className="bg-transparent text-sm font-medium text-neutral-900 focus:outline-none"
                      aria-label="Theme"
                    >
                      {themeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2">
                    <SlidersHorizontal className="h-4 w-4 text-neutral-700" aria-hidden />
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Sort by
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-sm font-medium text-neutral-900 focus:outline-none"
                      aria-label="Sort by"
                    >
                      {sortOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-900 hover:border-honey"
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                      Reset
                    </span>
                  </button>
                </div>

                <div className="ml-auto hidden items-center gap-2 text-xs text-neutral-600 sm:flex">
                  <span className="rounded-full bg-honey/15 px-2.5 py-1 font-semibold text-neutral-900">
                    {filteredPackages.length} results
                  </span>
                  <span className="hidden items-center gap-1 text-neutral-500 md:inline-flex">
                    <ChevronDown className="h-4 w-4 opacity-60" aria-hidden />
                    Filters
                  </span>
                </div>
              </div>
              <div className="border-t border-neutral-200/70 px-4 py-2 text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">Tip:</span> Use keywords like “premium” or
                “escape”.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 pb-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
            <div className="grid gap-6 p-6 lg:grid-cols-12 lg:gap-8 lg:p-8">
              <div className="lg:col-span-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                  {aboutDestination.titleKicker}
                </p>
                <h2 className="mt-3 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
                  {aboutDestination.title}
                </h2>
                <p className="mt-3 text-sm font-medium text-neutral-700">{aboutDestination.subtitle}</p>

                <div className="mt-4 space-y-3 text-sm text-neutral-600">
                  <p>{aboutDestination.body[0]}</p>
                  {aboutExpanded && <p>{aboutDestination.body[1]}</p>}
                  <button
                    type="button"
                    onClick={() => setAboutExpanded((v) => !v)}
                    className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-neutral-900 hover:text-honey-dark"
                  >
                    {aboutExpanded ? 'Read less' : 'Read more'}
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="grid gap-3 sm:grid-cols-4">
                  {aboutDestination.facts.map((f) => {
                    const Icon = f.icon
                    return (
                      <div
                        key={f.label}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-950 text-honey">
                            <Icon className="h-4 w-4" aria-hidden />
                          </span>
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                              {f.label}
                            </p>
                            <p className="mt-0.5 truncate text-sm font-semibold text-neutral-950">
                              {f.value}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAboutTab('facts')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      aboutTab === 'facts'
                        ? 'bg-neutral-950 text-honey'
                        : 'border border-neutral-200 bg-white text-neutral-700 hover:border-honey'
                    }`}
                  >
                    Factsheet
                  </button>
                  <button
                    type="button"
                    onClick={() => setAboutTab('why')}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      aboutTab === 'why'
                        ? 'bg-honey text-neutral-950'
                        : 'border border-neutral-200 bg-white text-neutral-700 hover:border-honey'
                    }`}
                  >
                    Why visit?
                  </button>
                  <div className="ml-auto text-xs font-semibold text-neutral-500">
                    Full guide <span aria-hidden>›</span>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-4">
                  {aboutTab === 'facts' ? (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {aboutDestination.facts.slice(0, 4).map((f) => (
                        <div key={f.label} className="flex items-center justify-between gap-3">
                          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                            {f.label}
                          </span>
                          <span className="text-sm font-semibold text-neutral-950">{f.value}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <ul className="space-y-2 text-sm text-neutral-700">
                      {aboutDestination.why.map((line) => (
                        <li key={line} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-neutral-50 py-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.18] hb-flight-bg" />
          <div className="absolute -top-24 left-[-10%] h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.45),transparent_60%)] blur-2xl hb-blob-a" />
          <div className="absolute bottom-[-18%] right-[-8%] h-80 w-80 rounded-full bg-[radial-gradient(circle_at_center,rgba(17,24,39,0.35),transparent_62%)] blur-2xl hb-blob-b" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/35" />
        </div>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Curated journeys
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
                {destinationLabel} Packages
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-neutral-600">
                Pick a signature route and tune it with hotels, add-ons, and pacing — we’ll personalize it end to end.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-honey">
                {filteredPackages.length} options
              </span>
              <span className="hidden text-xs font-medium text-neutral-500 sm:inline">
                Scroll for top picks
              </span>
            </div>
          </div>

          <div className="mt-6 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 pr-2">
              {filteredPackages.map((pkg, idx) => {
                const badgeMeta =
                  pkg.badge === 'curated'
                    ? { label: 'Curated', className: 'bg-rose-600' }
                    : pkg.badge === 'trending'
                      ? { label: 'Trending', className: 'bg-amber-500' }
                      : pkg.badge === 'underrated'
                        ? { label: 'Underrated', className: 'bg-violet-600' }
                        : { label: 'Trending', className: 'bg-amber-500' }

                return (
                  <article
                    key={pkg.id}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        goToPackageDetail(pkg)
                      }
                    }}
                    onClick={() => goToPackageDetail(pkg)}
                    className="group w-[320px] cursor-pointer overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative">
                      <img
                        src={pkg.image}
                        alt={pkg.name}
                        className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                      <div
                        className={`absolute left-3 top-3 inline-flex rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white ${badgeMeta.className}`}
                      >
                        {badgeMeta.label}
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                        <span className="rounded-full bg-neutral-900/90 px-3 py-1 text-xs font-semibold text-white">
                          {pkg.durationLabel}
                        </span>
                        <span className="rounded-full bg-honey px-3 py-1 text-xs font-semibold text-neutral-950">
                          From ₹{pkg.from.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="p-5">
                      <h3 className="font-display text-xl font-semibold text-neutral-950">{pkg.name}</h3>
                      <ul className="mt-3 space-y-1.5 text-xs text-neutral-700">
                        {pkg.coverBullets?.slice(0, 4).map((p) => (
                          <li key={p} className="flex gap-2">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                            <span className="line-clamp-1">{p}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
                            Curated price
                          </p>
                          <p className="mt-1 text-lg font-semibold text-neutral-900">₹{pkg.from.toLocaleString()}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            goToPackageDetail(pkg)
                          }}
                          className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-sm transition hover:bg-neutral-900"
                          aria-label={`Open details for ${pkg.name}`}
                        >
                          <ArrowRight className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                {destinationLabel} edition
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
                Honeybee Curations: {destinationLabel}
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Curated routes that feel smooth from pickup to sunset.
              </p>
            </div>
            <span className="rounded-full bg-neutral-950 px-3 py-1.5 text-xs font-semibold text-honey">
              {filteredPackages.length} handpicks
            </span>
          </div>

          <div className="mt-7 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-4 pr-2">
              {filteredPackages.map((pkg) => (
                <article
                  key={`handpicked-${pkg.name}`}
                  className="w-[320px] overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative h-40">
                    <img
                      src={pkg.image}
                      alt={pkg.name}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
                    <div className="absolute left-3 top-3 inline-flex rounded-full bg-honey px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-950">
                      Handpicked
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-neutral-900">
                        {pkg.durationLabel}
                      </span>
                      <span className="rounded-full bg-neutral-950/90 px-3 py-1 text-[11px] font-semibold text-honey">
                        From ₹{pkg.from.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display text-xl font-semibold text-neutral-950">{pkg.name}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                      {pkg.coverBullets?.slice(0, 3).map((p) => (
                        <li key={p} className="flex gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                          <span className="line-clamp-1">{p}</span>
                        </li>
                      ))}
                    </ul>
                    {pkg.cmsPackage && pkg.packageSlug ? (
                      <Link
                        to={`/packages/${pkg.packageSlug}`}
                        className="mt-5 flex w-full items-center justify-center rounded-full bg-neutral-950 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-900"
                      >
                        Plan your handpicked route
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActivePackage(pkg)}
                        className="mt-5 w-full rounded-full bg-neutral-950 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-900"
                      >
                        Plan your handpicked route
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">Most loved</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">Honeybee Picks</h2>
              <p className="mt-2 text-sm text-neutral-600">
                Top {destinationLabel} routes loved for their pace, day trips, and comfortable logistics.
              </p>
            </div>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {honeybeePicksPackages.map((pkg, idx) => (
              <article
                key={`picks-${pkg.name}`}
                className="overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-50 shadow-sm"
              >
                <div className="relative">
                  <img src={pkg.image} alt={pkg.name} className="h-36 w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                  <div className="absolute left-3 top-3 inline-flex rounded-full bg-neutral-950/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-honey">
                    {idx % 2 === 0 ? 'Featured' : 'Top pick'}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-neutral-950">{pkg.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-neutral-900">
                      {pkg.durationLabel}
                    </span>
                    <span className="rounded-full bg-honey px-3 py-1 text-[11px] font-semibold text-neutral-950">
                      From ₹{pkg.from.toLocaleString()}
                    </span>
                  </div>
                  {pkg.cmsPackage && pkg.packageSlug ? (
                    <Link
                      to={`/packages/${pkg.packageSlug}`}
                      className="mt-5 flex w-full items-center justify-center rounded-full bg-neutral-950 py-2 text-sm font-semibold text-white transition hover:bg-neutral-900"
                    >
                      Get this route
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setActivePackage(pkg)}
                      className="mt-5 w-full rounded-full bg-neutral-950 py-2 text-sm font-semibold text-white transition hover:bg-neutral-900"
                    >
                      Get this route
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-950 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-honey">
                Why choose {destinationLabel}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-white sm:text-4xl">
                Culture + coast, perfectly paced
              </h2>
              <p className="mt-3 text-sm text-white/75 sm:text-base">
                Handcrafted routes that bring temples, beaches, and iconic day trips together — without the rushed feeling.
              </p>
            </div>
            <button
              type="button"
              onClick={() => openBooking({ destination: d.title })}
              className="inline-flex items-center justify-center rounded-full bg-honey px-7 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-honey-dark"
            >
              Plan my {destinationLabel}
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: 'Iconic culture', text: 'Temples, arts, and storytelling moments across the island.' },
              { title: 'Coast & sunsets', text: 'Beach time that feels premium — not just rushed photo stops.' },
              { title: 'Smart day trips', text: 'Nusa Penida + key viewpoints, scheduled for less stress.' },
              { title: 'Smooth logistics', text: 'Private transfers and local support to keep everything seamless.' },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <p className="font-semibold text-honey">{item.title}</p>
                <p className="mt-2 text-sm text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
                Blogs for {destinationLabel}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-950 sm:text-4xl">
                Quick reads before you fly
              </h2>
              <p className="mt-2 text-sm text-neutral-600">
                Five short guides to help you choose where to stay, what to do, and how to plan the smoothest route.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-900"
            >
              Explore more
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {destinationBlogs.map((b) => (
              <article
                key={b.title}
                className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-28 bg-neutral-950">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.45),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.6),transparent_60%)]" />
                  <div className="absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:18px_18px]" />
                  <div className="relative flex h-full items-end justify-between gap-3 p-4">
                    <span className="inline-flex rounded-full bg-honey px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-950">
                      {b.tag}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                      <Clock3 className="h-3.5 w-3.5" aria-hidden />
                      {b.readMins} min
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold text-neutral-950">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{b.excerpt}</p>
                  <button
                    type="button"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-neutral-950 hover:text-honey-dark"
                  >
                    Read blog
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {d.id === 'bali-serenity' ? <BaliSerenityReviews /> : null}

      <Faq />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <PackagePolicySections />
      </div>

      {!hideBaliStaticPlanSections && (
        <>
      <section className="bg-neutral-50 pb-10">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-8">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">Package Highlights</p>
            <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">What makes this trip special</h2>
            <ul className="mt-5 space-y-3">
              {(d.highlights?.length ? d.highlights : baliHighlights).map((line) => (
                <li key={line} className="flex gap-2 text-sm text-slate-700">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {line}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Travel style</p>
              <p className="mt-1">
                {`${typeof d.budget === 'string' && d.budget.length > 0 ? `${d.budget[0].toUpperCase()}${d.budget.slice(1)}` : 'Curated'} ${d.duration} itinerary crafted for smooth experiences.`}
              </p>
            </div>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Starting from</p>
              <p className="mt-2 font-display text-4xl font-semibold text-slate-900">${d.priceFrom}</p>
              <p className="text-sm text-slate-500">per person (double occupancy)</p>
              <button
                type="button"
                onClick={() => openBooking({ destination: d.title })}
                className="mt-5 w-full rounded-full bg-honey py-3 text-sm font-semibold text-neutral-900 hover:bg-honey-dark"
              >
                Plan this trip
              </button>
              <div className="mt-4 space-y-2 text-xs text-slate-600">
                <p>Duration: {d.duration}</p>
                <p>Destination: {destinationCountry}</p>
                <p>Trip type: Couple / Friends / Family</p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-700">
            Day-wise itinerary
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold text-slate-900">
            Your {destinationLabel} plan
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {d.itinerary.map((day) => (
              <article key={day.day} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">
                  Day {String(day.day).padStart(2, '0')}
                </p>
                <h3 className="mt-2 font-semibold text-neutral-900">{day.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{day.text}</p>
                {day.image ? (
                  <img
                    src={day.image}
                    alt={day.title}
                    className="mt-3 h-36 w-full rounded-2xl object-cover"
                    loading="lazy"
                  />
                ) : null}
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-5">
            <h3 className="font-display text-xl font-semibold text-slate-900">Included in this itinerary</h3>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              {(d.included?.length ? d.included : baliInclusions).map((item) => (
                <li key={item} className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

        </>
      )}

      {destinationPackageCards.length > 0 ? (
        <section className="bg-slate-50 py-14 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">More destinations</p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
                  You might also like
                </h2>
              </div>
              <p className="text-xs text-neutral-500 md:text-right">Swipe or use arrows to browse</p>
            </div>

            <div className="relative md:px-12">
              <button
                type="button"
                onClick={() => scrollMoreLike(-1)}
                className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition hover:border-honey hover:text-neutral-900 md:flex"
                aria-label="Scroll packages left"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => scrollMoreLike(1)}
                className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-md transition hover:border-honey hover:text-neutral-900 md:flex"
                aria-label="Scroll packages right"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
              </button>
              <div
                ref={moreLikeScrollRef}
                className="scrollbar-hide -mx-1 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-2 pl-1 pr-1 md:mx-0"
              >
                {destinationPackageCards.map((pkg) => renderYouMightAlsoLikeCard(pkg))}
              </div>
            </div>

            <div className="mt-3 flex justify-center gap-2 md:hidden">
              <button
                type="button"
                onClick={() => scrollMoreLike(-1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollMoreLike(1)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 shadow-sm"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {/* Package details modal */}
      {activePackage && (
        <div
          className="fixed inset-0 z-[450] flex items-end justify-center bg-black/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Package details"
        >
          <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4 sm:px-6">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  {activePackage.badge} • {activePackage.durationLabel}
                </p>
                <h3 className="mt-1 truncate font-display text-2xl font-semibold text-neutral-950">
                  {activePackage.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePackage(null)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition hover:bg-neutral-50"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[78vh] overflow-y-auto">
              <div className="relative">
                <img src={activePackage.image} alt="" className="h-60 w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="rounded-full bg-neutral-900/85 px-4 py-2 text-xs font-semibold text-white">
                    {activePackage.durationLabel}
                  </span>
                  <span className="rounded-full bg-honey px-4 py-2 text-xs font-semibold text-neutral-950">
                    From ₹{activePackage.from.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="px-5 py-7 sm:px-8">
                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                  <div className="lg:col-span-2">
                    <h4 className="font-display text-xl font-semibold text-neutral-950">Tour highlights</h4>
                    <ul className="mt-4 space-y-2">
                      {activePackage.tourHighlights?.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>

                    <h4 className="mt-8 font-display text-xl font-semibold text-neutral-950">Itineraries</h4>
                    <div className="mt-4 space-y-3">
                      {activePackage.itineraryDays?.map((day) => {
                        const open = openItineraryDay === day.day
                        return (
                          <div key={day.day} className="rounded-2xl border border-neutral-200 bg-white">
                            <button
                              type="button"
                              onClick={() => setOpenItineraryDay((v) => (v === day.day ? null : day.day))}
                              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                              aria-expanded={open}
                            >
                              <div className="min-w-0">
                                <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">
                                  Day {String(day.day).padStart(2, '0')}
                                </p>
                                <p className="mt-1 truncate text-sm font-semibold text-neutral-950">{day.title}</p>
                              </div>
                              <ChevronDown
                                className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform ${
                                  open ? 'rotate-180' : ''
                                }`}
                                aria-hidden
                              />
                            </button>
                            {open && (
                              <div className="space-y-3 px-4 pb-4 pt-0 text-sm text-neutral-600">
                                <p>{day.text}</p>
                                {day.image ? (
                                  <img
                                    src={day.image}
                                    alt={day.title}
                                    className="h-36 w-full rounded-xl object-cover"
                                    loading="lazy"
                                  />
                                ) : null}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <aside className="lg:col-span-1">
                    <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
                      <h4 className="font-display text-lg font-semibold text-neutral-950">
                        {activePackage.hotel?.title ?? 'Where you stay'}
                      </h4>
                      <p className="mt-3 text-sm leading-relaxed text-neutral-700">{activePackage.hotel?.text}</p>
                      <div className="mt-4 rounded-2xl bg-white p-3 text-xs text-neutral-600">
                        Availability depends on your travel dates.
                      </div>
                    </div>
                  </aside>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="font-display text-lg font-semibold text-neutral-950">Package inclusions</h4>
                    <ul className="mt-4 space-y-2">
                      {activePackage.packageInclusions?.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-honey" strokeWidth={2.5} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-neutral-950">Package exclusions</h4>
                    <ul className="mt-4 space-y-2">
                      {activePackage.packageExclusions?.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-neutral-900" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10 grid gap-4 lg:grid-cols-2">
                  <div>
                    <h4 className="font-display text-lg font-semibold text-neutral-950">Important notes</h4>
                    <ul className="mt-4 space-y-2">
                      {activePackage.importantNotes?.map((note) => (
                        <li key={note} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-display text-lg font-semibold text-neutral-950">Terms and conditions</h4>
                    <ul className="mt-4 space-y-2">
                      {activePackage.terms?.map((t) => (
                        <li key={t} className="flex items-start gap-2 text-sm text-neutral-700">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-10">
                  <h4 className="font-display text-lg font-semibold text-neutral-950">FAQ</h4>
                  <div className="mt-4 space-y-2">
                    {activePackage.faq?.map((f, idx) => {
                      const open = openFaqIndex === idx
                      return (
                        <div key={f.q} className="rounded-2xl border border-neutral-200 bg-white">
                          <button
                            type="button"
                            onClick={() => setOpenFaqIndex((v) => (v === idx ? null : idx))}
                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
                            aria-expanded={open}
                          >
                            <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-950">{f.q}</p>
                            <ChevronDown
                              className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform ${
                                open ? 'rotate-180' : ''
                              }`}
                              aria-hidden
                            />
                          </button>
                          {open && <div className="px-4 pb-4 pt-0 text-sm text-neutral-600">{f.a}</div>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 border-t border-neutral-200 bg-white px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={() => {
                  openBooking({ destination: `${d.title} - ${activePackage.name}` })
                  setActivePackage(null)
                }}
                className="w-full rounded-full bg-honey py-3 text-sm font-semibold text-neutral-900 transition hover:bg-honey-dark"
              >
                Plan this trip
              </button>
            </div>
          </div>
        </div>
      )}

    </article>
  )
}

export function DestinationPackageDetail() {
  const { id: destinationSlug, packageId } = useParams()
  const destination = getDestinationBySlug(destinationSlug)
  const destinationRouteSlug = destination ? getDestinationSlug(destination) : ''
  const packageCards = useMemo(
    () => (destination ? createDestinationPackageCards(destination, destination.title) : []),
    [destination]
  )
  const normalizedPackageId = decodeURIComponent(String(packageId ?? ''))
    .toLowerCase()
    .replace(/^\/+|\/+$/g, '')
    .trim()
  const destinationIdPrefix = `${destination?.id ?? ''}-`.toLowerCase()
  const destinationSlugPrefix = `${destinationRouteSlug}-`.toLowerCase()
  const packageIdCandidates = [
    normalizedPackageId,
    normalizedPackageId.startsWith(destinationIdPrefix)
      ? normalizedPackageId.slice(destinationIdPrefix.length)
      : normalizedPackageId,
    normalizedPackageId.startsWith(destinationSlugPrefix)
      ? normalizedPackageId.slice(destinationSlugPrefix.length)
      : normalizedPackageId,
  ].filter(Boolean)
  const basePkg =
    packageCards.find((p) =>
      packageIdCandidates.some(
        (candidate) =>
          p.id.toLowerCase() === candidate ||
          p.id.toLowerCase() === `${destinationIdPrefix}${candidate}`
      )
    ) ?? null

  const [adminPkg, setAdminPkg] = useState(null)
  const [hotelType, setHotelType] = useState('3-star')
  const [openDay, setOpenDay] = useState(null)
  const [openFaqIndex, setOpenFaqIndex] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const packages = await fetchPublic('packages')
        if (!alive) return
        const matched = (Array.isArray(packages) ? packages : []).find((item) => {
          const slug = String(item.slug || '').toLowerCase().trim()
          const id = String(item.id || '').toLowerCase().trim()
          const title = String(item.title || '').toLowerCase().trim()
          return packageIdCandidates.some((candidate) => candidate === slug || candidate === id || candidate === title)
        })
        if (!matched?.id) {
          if (alive) setAdminPkg(null)
          return
        }

        const [itineraryRows, hotelRows] = await Promise.all([
          fetchPackageItineraries([matched.id]),
          fetchPackageHotels([matched.id]),
        ])
        if (!alive) return

        setAdminPkg(mapAdminPackageToCard(matched, itineraryRows, hotelRows))
      } catch {
        if (alive) setAdminPkg(null)
      }
    })()
    return () => {
      alive = false
    }
  }, [normalizedPackageId, destinationIdPrefix, destinationSlugPrefix])

  const pkg = adminPkg ?? basePkg

  useSeo(
    pkg
      ? {
          title: `${pkg.name} - ${destination?.title ?? 'Destination'} Package`,
          description: pkg.tourHighlights?.[0] ?? pkg.name,
        }
      : { title: 'Package not found', description: 'Package not found.' }
  )

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'itinerary', label: 'Itinerary' },
    { id: 'stay', label: 'Stay' },
    { id: 'inclusions', label: 'Inclusions' },
    { id: 'faq', label: 'FAQ' },
    { id: 'notes', label: 'Notes' },
    { id: 'tc', label: 'T&C' },
    { id: 'cancellation', label: 'Cancellation' },
  ]

  const scrollToId = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const fallbackStayOptions = {
    '3-star': [
      {
        image: '/bali-detail/4-807dce5b-2e76-43be-9dc9-a0e82028b02a.png',
        title: 'Cozy Retreat Kuta',
        subtitle: 'Comfort room • Kuta',
      },
      {
        image: '/bali-detail/3-209337d1-2006-4819-bad0-ace70d78b540.png',
        title: 'Garden Stay Ubud',
        subtitle: 'Comfort room • Ubud',
      },
    ],
    '4-star': [
      {
        image: '/bali-detail/5-a5f30014-10f8-4ff6-9439-de5cd4e11cf4.png',
        title: 'Ramayana Resort Kuta',
        subtitle: 'Premium room • Kuta',
      },
      {
        image: '/bali-detail/7-8f6cdf36-9bf0-4d90-9c80-12c3c855874d.png',
        title: 'Villa at Seminyak',
        subtitle: 'Premium room • Seminyak',
      },
    ],
    '5-star': [
      {
        image: '/bali-detail/6-4f4be34e-483c-4245-bd3d-16918096a965.png',
        title: 'The Alena Resort A Pramana',
        subtitle: 'Signature suite • Ubud',
      },
      {
        image: '/bali-detail/8-a74a9783-f813-498a-b549-71f40a0f43a5.png',
        title: 'Ocean Luxe Hideaway',
        subtitle: 'Signature suite • Beachfront',
      },
    ],
  }

  if (!pkg) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-neutral-900">Package not found</h1>
        <p className="mt-3 text-sm text-neutral-600">Try going back to destination packages.</p>
        {destination && (
          <Link
            to={`/destinations/${getDestinationSlug(destination) || destination.id}`}
            className="mt-6 inline-block text-honey-dark underline font-medium"
          >
            Back to {destination.title}
          </Link>
        )}
      </div>
    )
  }

  const stayOptions = pkg.stayOptions ?? fallbackStayOptions

  return (
    <article className="bg-neutral-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img src={pkg.image} alt="" className="h-[48vh] min-h-[340px] w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-24 sm:px-6 lg:px-8 lg:pb-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-honey">
                {pkg.badge.toUpperCase()} • {pkg.durationLabel}
              </p>
              <h1 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
                {pkg.name}
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">
                A carefully curated {destination?.title ?? 'destination'} route with smooth transfers, handpicked stops, and guided pacing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white/90">
                From ₹{pkg.from.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 rounded-2xl bg-white/95 p-2 shadow-sm backdrop-blur-sm">
            <div className="flex flex-wrap items-center gap-2">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => scrollToId(t.id)}
                  className="rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-neutral-700 transition hover:bg-honey/20"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            {/* Major Highlights */}
            <section id="overview" className="scroll-mt-24">
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">
                  Major Highlights
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">
                  Key experiences for your journey
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {pkg.coverBullets?.[0] ?? 'Curated moments designed to keep the flow smooth.'}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {pkg.tourHighlights?.map((h) => (
                  <div key={h} className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 rounded-full bg-honey" />
                      <p className="text-sm font-semibold text-neutral-900">{h}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Itinerary */}
            <section id="itinerary" className="mt-12 scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Your Daily Itinerary</p>
              <h2 className="mt-2 font-display text-3xl font-semibold text-neutral-900 sm:text-4xl">Day-wise journey plan</h2>

              <div className="mt-8">
                <div className="relative">
                  {/* vertical line */}
                  <div className="pointer-events-none absolute left-6 top-0 bottom-0 hidden border-l border-dashed border-neutral-200 sm:block" />

                  <div className="space-y-3">
                    {pkg.itineraryDays?.map((day) => {
                      const open = openDay === day.day
                      return (
                        <div
                          key={day.day}
                          className="relative flex items-stretch gap-3 sm:gap-4"
                        >
                          {/* Day badge + connector */}
                          <div className="relative z-10 flex flex-col items-center sm:items-start">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-honey shadow-sm">
                              <span className="text-[10px] font-semibold">
                                {String(day.day).padStart(2, '0')}
                              </span>
                            </div>
                            {/* dot for small screens */}
                            <div className="mt-1 hidden h-full w-px bg-neutral-200 sm:block" />
                          </div>

                          {/* Card */}
                          <div className="flex-1 overflow-hidden rounded-3xl border border-neutral-200 bg-white/90 shadow-sm transition hover:border-honey/60 hover:bg-white">
                            <button
                              type="button"
                              onClick={() => setOpenDay((v) => (v === day.day ? null : day.day))}
                              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
                              aria-expanded={open}
                            >
                              <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                                  Day {String(day.day).padStart(2, '0')}
                                </p>
                                <p className="mt-1 text-sm font-semibold text-neutral-950">{day.title}</p>
                                <p className="text-xs text-neutral-500">Tap to {open ? 'collapse' : 'expand'}</p>
                              </div>
                              <ChevronDown
                                className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform ${
                                  open ? 'rotate-180' : ''
                                }`}
                                aria-hidden
                              />
                            </button>
                            {open && (
                              <div className="border-t border-neutral-100 px-4 pb-4 pt-3 text-sm leading-relaxed text-neutral-600 sm:px-5">
                                <p>{day.text}</p>
                                {day.image ? (
                                  <img
                                    src={day.image}
                                    alt={day.title}
                                    className="mt-3 h-44 w-full rounded-2xl object-cover"
                                    loading="lazy"
                                  />
                                ) : null}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Package Highlights */}
            <section className="mt-12 scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Package Highlights</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">Quick facts & details</h2>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Duration</p>
                  <p className="mt-2 text-sm font-bold text-neutral-900">{pkg.durationLabel}</p>
                </div>
                <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Destinations covered</p>
                  <p className="mt-2 text-sm font-bold text-neutral-900">{pkg.keywords?.slice(0, 3).join(', ')}</p>
                </div>
                <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">For</p>
                  <p className="mt-2 text-sm font-bold text-neutral-900">Couples & friends</p>
                </div>
              </div>
            </section>

            {/* Where you'll stay */}
            <section id="stay" className="mt-12 scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Where You&apos;ll Stay</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">Comfortable accommodations</h2>

              {/* Inline hotel-type toggle for the stay cards */}
              <div className="mt-6 flex flex-wrap items-center gap-2">
                {['3-star', '4-star', '5-star'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setHotelType(t)}
                    className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition ${
                      hotelType === t
                        ? 'border-honey bg-honey/25 text-neutral-950 shadow-[0_0_0_1px_rgba(249,168,38,0.7),0_0_30px_rgba(249,168,38,0.25)]'
                        : 'border-neutral-200 bg-white/70 text-neutral-600 hover:border-honey hover:text-neutral-900 hover:shadow-[0_0_0_1px_rgba(249,168,38,0.45)]'
                    }`}
                  >
                    {t === '3-star' ? '3 Star' : t === '4-star' ? '4 Star' : '5 Star'}
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {(stayOptions[hotelType] ?? stayOptions['3-star']).map((opt) => (
                  <div
                    key={opt.title}
                    className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:border-honey/70 hover:shadow-md"
                  >
                    {/* edge lighting on hover */}
                    <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-honey/0 transition group-hover:ring-honey/40" />
                    <img src={opt.image} alt="" className="h-40 w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                    <div className="p-5">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Handpicked</p>
                        <span className="inline-flex rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-honey/90">
                          {hotelType === '3-star' ? 'Value' : hotelType === '4-star' ? 'Comfort' : 'Luxury'}
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-neutral-950">{opt.title}</p>
                      <p className="mt-1 text-sm text-neutral-600">{opt.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Package Inclusions + Exclusions */}
            <section id="inclusions" className="mt-12 scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-honey">Package Inclusions</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">Everything included</h2>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="group relative overflow-hidden rounded-3xl border border-honey/25 bg-neutral-950/95 p-5 text-white shadow-sm transition hover:border-honey/50 hover:shadow-md">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(249,168,38,0.35),transparent_50%)]" />
                  <h3 className="relative font-semibold text-honey">What&apos;s included</h3>
                  <ul className="relative mt-3 space-y-2 text-sm text-white/80">
                    {pkg.packageInclusions?.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-honey" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="group relative overflow-hidden rounded-3xl border border-honey/25 bg-white p-5 shadow-sm transition hover:border-honey/50 hover:shadow-md">
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_right,rgba(249,168,38,0.22),transparent_52%)]" />
                  <h3 className="relative font-semibold text-neutral-950">Exclusions</h3>
                  <ul className="relative mt-3 space-y-2 text-sm text-neutral-700">
                    {pkg.packageExclusions?.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-honey" strokeWidth={2.5} />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section id="faq" className="mt-12 scroll-mt-24">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-600">Frequently Asked Questions</p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-neutral-900 sm:text-3xl">Quick answers</h2>

              <div className="mt-6 space-y-3">
                {pkg.faq?.map((f, idx) => {
                  const open = openFaqIndex === idx
                  return (
                    <div key={f.q} className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex((v) => (v === idx ? null : idx))}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                        aria-expanded={open}
                      >
                        <p className="min-w-0 flex-1 truncate text-sm font-semibold text-neutral-950">{f.q}</p>
                        <ChevronDown
                          className={`h-5 w-5 shrink-0 text-neutral-500 transition-transform ${open ? 'rotate-180' : ''}`}
                          aria-hidden
                        />
                      </button>
                      {open && <div className="px-5 pb-5 text-sm leading-relaxed text-neutral-600">{f.a}</div>}
                    </div>
                  )
                })}
              </div>
            </section>

            <PackagePolicySections />
          </div>

          {/* Right panel: Hotel type + quick enquiry */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-5">
              <div className="rounded-3xl border border-honey/30 bg-neutral-950/95 p-5 shadow-lg text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Select Hotel Type</p>
                <div className="mt-4 grid gap-3">
                  {['3-star', '4-star', '5-star'].map((t, idx) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setHotelType(t)}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                        hotelType === t
                          ? 'border-honey bg-honey/20 shadow-[0_0_0_1px_rgba(249,168,38,0.8),0_0_24px_rgba(249,168,38,0.5)]'
                          : 'border-white/10 bg-white/5 hover:border-honey/60 hover:shadow-[0_0_0_1px_rgba(249,168,38,0.5)]'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${hotelType === t ? 'text-neutral-900' : 'text-white'}`}>
                        {t === '3-star' ? '3 Star' : t === '4-star' ? '4 Star' : '5 Star'}
                      </span>
                      <span className="text-xs font-semibold text-white/70">{idx + 3}★</span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-honey/20 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Estimated Price</p>
                  <p className="mt-2 text-2xl font-bold text-honey">₹{pkg.from.toLocaleString()}</p>
                  <p className="mt-1 text-xs text-white/70">per person (double occupancy)</p>
                </div>
              </div>

              <div className="rounded-3xl border border-honey/30 bg-neutral-950/90 p-5 shadow-sm text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Quick Enquiry</p>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    alert('Enquiry sent (demo). We will contact you shortly.')
                  }}
                >
                  <input required placeholder="Full Name" className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60" />
                  <input
                    required
                    placeholder="Email"
                    type="email"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60"
                  />
                  <input
                    required
                    placeholder="Phone Number"
                    className="w-full rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60"
                  />
                  <textarea
                    placeholder="Comment"
                    className="w-full resize-none rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/60"
                  />
                  <button
                    type="submit"
                    className="w-full rounded-2xl bg-honey px-4 py-3 text-sm font-bold text-neutral-900 transition hover:bg-honey-dark"
                  >
                    Send Enquiry
                  </button>
                  <p className="text-xs text-neutral-500">
                    Hotel type: <span className="font-semibold">{hotelType}</span>
                  </p>
                </form>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  )
}

export function DestinationDetail() {
  const { id: destinationSlug } = useParams()
  return <DestinationDetailPage destinationSlug={destinationSlug} />
}

export function DestinationDetailPage({ destinationSlug }) {
  const params = useParams()
  const resolvedSlug = useMemo(() => {
    const raw = destinationSlug ?? params.id ?? ''
    return decodeURIComponent(String(raw)).replace(/^\/+|\/+$/g, '').trim()
  }, [destinationSlug, params.id])
  const d = getDestinationBySlug(resolvedSlug)
  const { openBooking } = useBooking()

  useSeo(
    d
      ? {
          title: d.title,
          description: d.shortDescription,
        }
      : { title: 'Not found', description: 'Destination not found.' }
  )

  if (!d) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl text-neutral-900">Destination not found</h1>
        <Link to="/destinations" className="mt-6 inline-block text-honey-dark underline font-medium">
          Back to destinations
        </Link>
      </div>
    )
  }

  return <DestinationPage d={d} openBooking={openBooking} />
}
