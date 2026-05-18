import { destinations } from '../../frontend/src/data/destinations.js'
import { guestStories } from '../../frontend/src/data/guestStories.js'
import {
  footerInternational,
  footerDomestic,
  footerThemes,
} from '../../frontend/src/data/footerLinks.js'
import { trendingByScope } from '../../frontend/src/data/trendingDestinations.js'

function esc(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "''")
}

function slugify(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const lines = []
lines.push('-- Generated from frontend static content')
lines.push('-- Seeds: reviews, blogs, settings, cms_items')
lines.push('START TRANSACTION;')
lines.push('')

// Reviews from guest stories
lines.push('-- Reviews')
lines.push("DELETE FROM reviews WHERE route='HoneyBee Trips';")
for (const [idx, s] of guestStories.entries()) {
  const name = s.name || `Guest ${idx + 1}`
  const route = 'HoneyBee Trips'
  const text = s.text || 'Great travel experience.'
  const rating = 4.8
  lines.push(
    `INSERT INTO reviews (name, route, text, rating, status, created_at)
VALUES ('${esc(name)}','${esc(route)}','${esc(text)}',${rating},'active',NOW());`
  )
}
lines.push('')

// Blogs from destination narratives
lines.push('-- Blogs')
for (const d of destinations) {
  const title = `${d.title} Travel Guide`
  const slug = slugify(`${d.id || d.title}-travel-guide`)
  const excerpt = d.shortDescription || `Plan your ${d.title} itinerary with HoneyBee.`
  const itinerary = Array.isArray(d.itinerary) ? d.itinerary : []
  const daySnippets = itinerary
    .slice(0, 3)
    .map((x) => `${x.title}: ${x.text}`)
    .join('\n')
  const content = `${excerpt}\n\nHighlights: ${(d.highlights || []).join(', ')}\n\nSample plan:\n${daySnippets}`
  const coverImage = d.image || d.banner || ''
  lines.push(
    `INSERT INTO blogs (title, slug, excerpt, content, cover_image, status, created_at, updated_at)
VALUES ('${esc(title)}','${esc(slug)}','${esc(excerpt)}','${esc(content)}','${esc(coverImage)}','active',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  excerpt=VALUES(excerpt), content=VALUES(content), cover_image=VALUES(cover_image), status=VALUES(status), updated_at=NOW();`
  )
}
lines.push('')

// Settings from footer lists
lines.push('-- Settings')
const settings = {
  site_phone: '+91-90000-00000',
  site_email: 'hello@honeybeetrips.com',
  site_address: 'India',
  instagram: 'https://instagram.com/honeybeetrips',
  facebook: 'https://facebook.com/honeybeetrips',
  youtube: 'https://youtube.com/@honeybeetrips',
  footer_international: footerInternational.join(', '),
  footer_domestic: footerDomestic.join(', '),
  footer_themes: footerThemes.join(', '),
}
for (const [k, v] of Object.entries(settings)) {
  lines.push(
    `INSERT INTO settings (\`key\`, \`value\`) VALUES ('${esc(k)}','${esc(v)}')
ON DUPLICATE KEY UPDATE \`value\`=VALUES(\`value\`);`
  )
}
lines.push('')

// CMS items from trending destinations
lines.push('-- CMS Items (trending sections)')
const sections = [
  { key: 'trending_international', rows: trendingByScope.international || [] },
  { key: 'trending_domestic', rows: trendingByScope.domestic || [] },
]
for (const section of sections) {
  lines.push(`DELETE FROM cms_items WHERE section='${esc(section.key)}';`)
  section.rows.forEach((row, idx) => {
    const title = row.label || `Item ${idx + 1}`
    const subtitle = row.to || ''
    const image = row.image || ''
    lines.push(
      `INSERT INTO cms_items (section, scope, title, subtitle, image_url, link_url, price, duration, badge, tags, extra_json, sort_order, status, created_at, updated_at)
VALUES ('${esc(section.key)}','global','${esc(title)}','${esc(subtitle)}','${esc(image)}','${esc(subtitle)}',0,'','','','',${idx + 1},'active',NOW(),NOW());`
    )
  })
}

lines.push('')
lines.push('COMMIT;')
lines.push('')

process.stdout.write(lines.join('\n'))
