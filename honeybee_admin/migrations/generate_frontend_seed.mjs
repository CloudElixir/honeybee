import { destinations } from '../../frontend/src/data/destinations.js'

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

function categoryFromRegion(region) {
  const r = String(region ?? '').toLowerCase()
  if (r === 'asia') return 'Domestic'
  return 'International'
}

const lines = []
lines.push('-- Generated from frontend/src/data/destinations.js')
lines.push('-- Imports packages + destinations + mapping + itineraries')
lines.push('START TRANSACTION;')
lines.push('')

for (const d of destinations) {
  const title = d.title || d.location || 'Untitled Package'
  const slug = slugify(d.id || title)
  const location = d.location || title
  const duration = d.duration || 'Custom duration'
  const price = Number.isFinite(Number(d.priceFrom)) ? Number(d.priceFrom) : 0
  const shortDesc = d.shortDescription || ''
  const highlights = Array.isArray(d.highlights) ? d.highlights.join(', ') : ''
  const inclusions = Array.isArray(d.included) ? d.included.join(', ') : ''
  const image = d.image || d.banner || ''
  const category = categoryFromRegion(d.region)

  lines.push(`-- ${esc(title)}`)
  lines.push(`INSERT INTO packages (title, category, location, price, duration, short_desc, full_desc, highlights, inclusions, exclusions, featured, status, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('${esc(title)}','${esc(category)}','${esc(location)}',${price},'${esc(duration)}','${esc(shortDesc)}','${esc(shortDesc)}','${esc(highlights)}','${esc(inclusions)}','','0','active','${esc(slug)}','${esc(title)}','${esc(shortDesc)}',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  title=VALUES(title), category=VALUES(category), location=VALUES(location), price=VALUES(price), duration=VALUES(duration),
  short_desc=VALUES(short_desc), full_desc=VALUES(full_desc), highlights=VALUES(highlights), inclusions=VALUES(inclusions),
  status=VALUES(status), meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();`)
  lines.push('')
  lines.push(`SET @pkg_id := (SELECT id FROM packages WHERE slug='${esc(slug)}' LIMIT 1);`)

  if (image) {
    lines.push(`INSERT IGNORE INTO package_images (package_id, image_path, created_at) VALUES (@pkg_id, '${esc(image)}', NOW());`)
  }

  const destSlug = slugify(location)
  lines.push(`INSERT INTO destinations (name, country, description, cover_image, slug, meta_title, meta_description, created_at, updated_at)
VALUES ('${esc(location)}','${esc(location)}','${esc(shortDesc)}','${esc(image)}','${esc(destSlug)}','${esc(title)}','${esc(shortDesc)}',NOW(),NOW())
ON DUPLICATE KEY UPDATE
  name=VALUES(name), country=VALUES(country), description=VALUES(description), cover_image=VALUES(cover_image),
  meta_title=VALUES(meta_title), meta_description=VALUES(meta_description), updated_at=NOW();`)
  lines.push(`SET @dest_id := (SELECT id FROM destinations WHERE slug='${esc(destSlug)}' LIMIT 1);`)
  lines.push('INSERT IGNORE INTO destination_package (destination_id, package_id) VALUES (@dest_id, @pkg_id);')

  lines.push('DELETE FROM itineraries WHERE package_id=@pkg_id;')
  const itinerary = Array.isArray(d.itinerary) ? d.itinerary : []
  itinerary.forEach((day, idx) => {
    const dayNum = Number.isFinite(Number(day.day)) ? Number(day.day) : idx + 1
    const dayTitle = day.title || `Day ${dayNum}`
    const dayText = day.text || ''
    lines.push(
      `INSERT INTO itineraries (package_id, day_number, title, description, sort_order, created_at) VALUES (@pkg_id, ${dayNum}, '${esc(dayTitle)}', '${esc(dayText)}', ${idx + 1}, NOW());`
    )
  })
  lines.push('')
}

lines.push('COMMIT;')
lines.push('')

process.stdout.write(lines.join('\n'))
