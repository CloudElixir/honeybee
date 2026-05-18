import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import * as Icons from 'lucide-react'
import { motion } from 'framer-motion'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'
import { useBooking } from '../context/BookingContext'
import { fetchPublic, mediaUrl } from '../api/adminPublic'

const slugify = (value) =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function Packages() {
  useSeo({
    title: 'Bali & Travel Packages',
    description: 'Bali-first packages plus honeymoon, family, adventure, and budget-smart trips by HoneybeeTrips.',
  })
  const { openBooking } = useBooking()
  const [adminPackages, setAdminPackages] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPublic('packages')
      .then((rows) => {
        if (!alive) return
        setAdminPackages(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setAdminPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  const categories = useMemo(() => {
    const rows = adminPackages || []
    if (!rows.length) return []

    const groups = new Map()
    for (const p of rows) {
      const key = (p.category || 'International').trim() || 'International'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(p)
    }

    return Array.from(groups.entries()).map(([name, list]) => ({
      id: String(name).toLowerCase().replace(/\s+/g, '-'),
      title: name,
      subtitle: `${list.length} live package${list.length === 1 ? '' : 's'} from your CMS`,
      icon: name.toLowerCase().includes('domestic') ? 'MapPinned' : 'Globe',
      items: list.map((p) => ({
        id: p.id,
        slug: p.slug || slugify(p.title || p.id),
        name: p.title || 'Untitled package',
        nights: p.duration || 'Custom duration',
        from: Number(p.price || 0),
        perks: (p.highlights || '')
          .split(/\r?\n|,/)
          .map((v) => v.trim())
          .filter(Boolean)
          .slice(0, 4),
        image:
          mediaUrl(p.image_path) ||
          mediaUrl(p.cover_image) ||
          'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
        badges: [
          p.is_curated ? 'CURATED' : null,
          p.is_trending ? 'TRENDING' : null,
          p.is_underrated ? 'UNDERRATED' : null,
          p.is_featured || p.featured ? 'HONEYBEE PICK' : null,
        ].filter(Boolean),
      })),
    }))
  }, [adminPackages])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        titleId="packages-title"
        eyebrow="Bali + Journeys"
        title="Best packages for Bali and beyond"
        subtitle="Start with Bali-ready itineraries and customize every trip with your preferred stays, pace, and experiences."
      />

      <div className="space-y-20">
        {adminPackages === null && (
          <p className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-neutral-600">
            Loading packages...
          </p>
        )}
        {adminPackages !== null && categories.length === 0 && (
          <p className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center text-neutral-600">
            No packages available yet. Add packages from admin panel.
          </p>
        )}
        {categories.map((cat) => {
          const Icon = Icons[cat.icon] || Icons.Sparkles
          return (
            <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
              <motion.div
                className="mb-8 flex items-center gap-4"
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-honey/15 text-neutral-900">
                  <Icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 id={`cat-${cat.id}`} className="font-display text-2xl font-semibold text-neutral-900">
                    {cat.title}
                  </h2>
                  <p className="text-sm text-neutral-600">{cat.subtitle}</p>
                </div>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-3">
                {cat.items.map((pkg, pi) => (
                  <motion.article
                    key={`${pkg.id}-${pkg.slug}`}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{ duration: 0.45, delay: pi * 0.06 }}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card"
                  >
                    <Link to={`/packages/${pkg.slug || slugify(pkg.name)}`} className="block">
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={pkg.image}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
                        <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900">
                          {pkg.nights}
                        </span>
                        {pkg.badges.length > 0 && (
                          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                            {pkg.badges.map((badge) => (
                              <span
                                key={`${pkg.id}-${badge}`}
                                className="rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white"
                              >
                                {badge}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="font-display text-lg font-semibold text-neutral-900">
                        <Link to={`/packages/${pkg.slug || slugify(pkg.name)}`} className="hover:text-honey transition">
                          {pkg.name}
                        </Link>
                      </h3>
                      <p className="mt-3 text-2xl font-semibold text-neutral-900">
                        ${pkg.from.toLocaleString()}
                        <span className="text-sm font-normal text-neutral-500"> from / person</span>
                      </p>
                      <ul className="mt-4 flex-1 space-y-2 text-sm text-neutral-600">
                        {pkg.perks.map((p) => (
                          <li key={p} className="flex gap-2">
                            <span className="text-gold">·</span>
                            {p}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to={`/packages/${pkg.slug || slugify(pkg.name)}`}
                        className="mt-6 flex w-full items-center justify-center rounded-full bg-honey py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-honey-dark"
                      >
                        View package details
                      </Link>
                      <button
                        type="button"
                        onClick={() => openBooking({ destination: pkg.name })}
                        className="mt-2 w-full rounded-full border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
                      >
                        Request this package
                      </button>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
