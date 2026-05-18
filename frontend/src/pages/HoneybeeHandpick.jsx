import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'
import { getSiteUrl } from '../lib/siteUrl'
import { fetchPackages, mediaUrl } from '../api/adminPublic'
import { normalizeSlug } from '../utils/packageLocationGroups'

export function HoneybeeHandpick() {
  const faq = [
    {
      q: 'What is included in Honeybee Handpick listings?',
      a: 'Honeybee Handpick includes planner-recommended routes selected for overall experience quality and smooth logistics.',
    },
    {
      q: 'How are handpicked trips different from regular listings?',
      a: 'Handpicked trips are short-listed by our team based on guest preferences, route quality, and destination value.',
    },
    {
      q: 'Can I request a custom route from a handpicked package?',
      a: 'Yes. Each handpicked package can be adjusted with your dates, stay preference, and activity style.',
    },
  ]

  const [packages, setPackages] = useState(null)

  useEffect(() => {
    let alive = true
    fetchPackages({ honeybee_pick: '1' })
      .then((rows) => {
        if (!alive) return
        setPackages(Array.isArray(rows) ? rows : [])
      })
      .catch((e) => {
        console.warn('[HoneybeeHandpick] API', e)
        if (!alive) return
        setPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  useSeo({
    title: 'Honeybee Handpick',
    description:
      'Browse Honeybee Handpick trips with our most recommended destinations and travel packages.',
    canonical: '/honeybee-handpick',
    keywords: ['handpicked trips', 'recommended honeymoon packages', 'curated travel itineraries'],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Honeybee Handpick',
        url: `${getSiteUrl()}/honeybee-handpick`,
        description:
          'Browse Honeybee Handpick trips with our most recommended destinations and travel packages.',
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
        titleId="honeybee-handpick-title"
        eyebrow="Signature Picks"
        title="Honeybee Handpick"
        subtitle="Packages marked “HoneyBee Pick” in admin — fully dynamic, no hardcoded trips."
      />

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          Toggle <strong>HoneyBee Pick</strong> on any package in the CRM to feature it here. Empty until you mark picks in admin.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/packages"
            className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-honey-dark"
          >
            All packages
          </Link>
          <Link
            to="/destinations"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
          >
            Browse destinations
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-neutral-900">Handpicked packages</h2>
        {packages === null && <p className="mt-4 text-sm text-neutral-600">Loading…</p>}
        {packages && packages.length === 0 && (
          <p className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 px-4 py-8 text-sm text-neutral-800">
            No HoneyBee Picks yet. In admin → Packages, enable <strong>HoneyBee Pick</strong> on active packages.
          </p>
        )}
        {packages && packages.length > 0 && (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((p) => {
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
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Honeybee Handpick FAQs</h2>
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
