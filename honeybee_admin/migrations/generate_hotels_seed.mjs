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

const lines = []
lines.push('-- Generated placeholder hotels from frontend destinations')
lines.push('START TRANSACTION;')
lines.push('')

for (const d of destinations) {
  const title = d.title || d.location || 'Untitled Package'
  const slug = slugify(d.id || title)
  const location = d.location || 'TBD'
  const notes = `Placeholder hotel entry for ${title}. Update with final stay details in Admin > Hotels.`

  lines.push(`-- ${esc(title)}`)
  lines.push(`SET @pkg_id := (SELECT id FROM packages WHERE slug='${esc(slug)}' LIMIT 1);`)
  lines.push('DELETE FROM package_hotels WHERE package_id=@pkg_id;')
  lines.push(
    `INSERT INTO package_hotels (package_id, name, location, notes, created_at) SELECT @pkg_id, '${esc(
      `${title} Signature Stay`
    )}', '${esc(location)}', '${esc(notes)}', NOW() WHERE @pkg_id IS NOT NULL;`
  )
  lines.push('')
}

lines.push('COMMIT;')
lines.push('')

process.stdout.write(lines.join('\n'))
