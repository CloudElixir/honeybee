/** @param {string} name */
export function destinationSlug(name) {
  return String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** @param {string} label */
function destLink(label) {
  const slug = destinationSlug(label)
  return { label: `${label} Holiday Packages`, to: `/destinations/${slug}` }
}

/** International destinations — Pickyourtrail-style grid (4 columns when chunked). */
export const footerInternationalDestinations = [
  'Australia',
  'Bali',
  'New Zealand',
  'Sri Lanka',
  'Saudi Arabia',
  'United Kingdom',
  'Dubai',
  'Maldives',
  'Japan',
  'France',
  'Italy',
  'Greece',
  'Singapore',
  'Seychelles',
  'Malaysia',
  'Switzerland',
  'Germany',
  'Thailand',
  'Vietnam',
  'Iceland',
  'United States',
  'Mauritius',
  'Spain',
  'Portugal',
  'Egypt',
  'Turkey',
  'South Africa',
  'Kenya',
].map(destLink)

/** India / domestic holiday packages */
export const footerDomesticDestinations = [
  'Kerala',
  'Goa',
  'Rajasthan',
  'Himachal',
  'Kashmir',
  'Ladakh',
  'Andaman',
  'Uttarakhand',
  'Sikkim',
  'Meghalaya',
].map((name) => ({ label: `${name} Holiday Packages`, to: `/domestic?q=${encodeURIComponent(name)}` }))

/** Themed travel — maps to site routes */
export const footerThemedDestinations = [
  { label: 'International Holiday Packages', to: '/international' },
  { label: 'International Honeymoon Packages', to: '/honeymoon-packages' },
  { label: 'International Family Packages', to: '/family-funventure' },
  { label: 'International Beach Packages', to: '/international' },
  { label: 'International Adventure Packages', to: '/packages' },
  { label: 'Summer Holiday Packages', to: '/packages' },
  { label: 'International Luxury Packages', to: '/honeybee-handpick' },
  { label: 'Northern Lights Holiday Packages', to: '/destinations/iceland' },
  { label: 'International Solo Travel Packages', to: '/packages' },
  { label: 'Romantic Getaway Packages', to: '/romantic-getaways' },
  { label: 'Group Departure Packages', to: '/group-departures' },
  { label: 'Domestic Holiday Packages', to: '/domestic' },
]

export const footerCompanyLinks = [
  { label: 'About us', to: '/about' },
  { label: 'Careers', to: '/contact' },
  { label: 'Blog', to: '/blogs' },
  { label: 'Testimonials', to: '/contact' },
  { label: 'Press', to: '/contact' },
]

export const footerPolicyLinks = [
  { label: 'Frequently asked questions', to: '/contact' },
  { label: 'Terms & conditions', to: '/contact' },
  { label: 'Privacy', to: '/contact' },
  { label: 'Cancellations', to: '/contact' },
  { label: 'Sitemap', to: '/destinations' },
  { label: 'Contact us', to: '/contact' },
]

/** Split flat link list into N columns (top-to-bottom per column). */
export function chunkFooterLinks(items, columns = 4) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return Array.from({ length: columns }, () => [])
  const perCol = Math.ceil(list.length / columns)
  return Array.from({ length: columns }, (_, col) => list.slice(col * perCol, col * perCol + perCol))
}
