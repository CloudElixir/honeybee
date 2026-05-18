import { writeFile, mkdir } from 'node:fs/promises'
import { destinations, getDestinationSlug } from '../src/data/destinations.js'

const siteUrl = (
  process.env.SITE_URL ||
  process.env.VITE_SITE_URL ||
  'https://slategrey-hamster-219402.hostingersite.com'
).replace(/\/+$/, '')

const staticPaths = [
  '/',
  '/destinations',
  '/packages',
  '/international',
  '/domestic',
  '/honeymoon-packages',
  '/romantic-getaways',
  '/group-departures',
  '/family-funventure',
  '/honeybee-handpick',
  '/about-us',
  '/contact',
]

const destinationPaths = destinations
  .map((d) => getDestinationSlug(d))
  .filter(Boolean)
  .map((slug) => `/destinations/${slug}`)

const allPaths = [...new Set([...staticPaths, ...destinationPaths])]

const now = new Date().toISOString()
const urls = allPaths
  .map(
    (path) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${now}</lastmod>
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`

await mkdir('dist', { recursive: true })
await writeFile('dist/sitemap.xml', xml, 'utf8')
await writeFile('public/sitemap.xml', xml, 'utf8')

console.log(`Generated sitemap with ${allPaths.length} URLs`)
