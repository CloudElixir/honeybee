import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'
import { getSiteUrl } from '../lib/siteUrl'
import { fetchPackages, mediaUrl } from '../api/adminPublic'
import { normalizeSlug } from '../utils/packageLocationGroups'

export function Domestic() {
  const faq = [
    {
      q: 'What kind of domestic trips can I plan here?',
      a: 'You can plan hill station, beach, cultural, and slow-travel domestic itineraries based on your travel style.',
    },
    {
      q: 'Can domestic trips be customized for honeymoon travelers?',
      a: 'Yes. We can customize domestic trips with romantic stays, private transfers, and experience-based pacing.',
    },
    {
      q: 'Do you support weekend and short-duration domestic routes?',
      a: 'Yes. We can build 3 to 6 day domestic routes for quick breaks or long weekends.',
    },
  ]

  const [packages, setPackages] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPackages({ category: 'Domestic' })
      .then((rows) => {
        if (!alive) return
        setPackages(Array.isArray(rows) ? rows : [])
      })
      .catch((e) => {
        console.warn('[Domestic] API', e)
        if (!alive) return
        setPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  useSeo({
    title: 'Domestic',
    description:
      'Discover domestic honeymoon and romantic getaway ideas curated by HoneybeeTrips.',
    canonical: '/domestic',
    keywords: ['domestic honeymoon packages', 'india romantic getaways', 'domestic tour planner'],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Domestic',
        url: `${getSiteUrl()}/domestic`,
        description:
          'Discover domestic honeymoon and romantic getaway ideas curated by HoneybeeTrips.',
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <SectionHeading
        titleId="domestic-title"
        eyebrow="India Getaways"
        title="Domestic"
        subtitle="Live domestic packages from your CMS — same database as the rest of the site."
      />

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          Build a domestic trip with curated stays and pacing. Listings below pull directly from your admin panel.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/destinations"
            className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-honey-dark"
          >
            Browse destination options
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
          >
            Plan a domestic trip
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-neutral-900">Domestic packages</h2>
        {packages === null && <p className="mt-4 text-sm text-neutral-600">Loading…</p>}
        {packages && packages.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-8 text-sm text-neutral-600">
            No active domestic packages yet. Add them in the admin under Packages (category: Domestic).
          </p>
        )}
        {packages && packages.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.slice(0, 18).map((p) => {
              const slug = normalizeSlug(p.slug || p.title || p.id)
              const img =
                mediaUrl(p.image_path) ||
                mediaUrl(p.cover_image) ||
                'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80'
              return (
                <li key={p.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
                  <Link to={`/packages/${slug}`} className="block">
                    <img src={img} alt="" className="aspect-[16/10] w-full object-cover" loading="lazy" />
                    <div className="p-4">
                      <p className="font-semibold text-neutral-900">{p.title}</p>
                      <p className="mt-1 text-xs text-neutral-600">{p.location}</p>
                      <p className="mt-2 text-sm font-medium text-neutral-800">
                        ${Number(p.price || 0).toLocaleString()} · {p.duration || 'Custom'}
                      </p>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Domestic travel FAQs</h2>
        <div className="mt-4 space-y-4">
          {faq.map((item) => (
            <article key={item.q}>
              <h3 className="text-sm font-semibold text-neutral-900">{item.q}</h3>
              <p className="mt-1 text-sm text-neutral-700">{item.a}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
