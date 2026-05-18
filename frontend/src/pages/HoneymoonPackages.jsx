import { Link } from 'react-router-dom'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'
import { getSiteUrl } from '../lib/siteUrl'

export function HoneymoonPackages() {
  const faq = [
    {
      q: 'Are honeymoon packages fixed or customizable?',
      a: 'All honeymoon packages are customizable with your preferred stay category, experiences, and day-wise pacing.',
    },
    {
      q: 'Can you plan honeymoon trips for different budgets?',
      a: 'Yes. We offer curated options from value-focused routes to premium luxury honeymoon journeys.',
    },
    {
      q: 'Do honeymoon packages include transfers and support?',
      a: 'Most routes include planned transfers and on-trip support to keep travel smooth and stress-free.',
    },
  ]

  useSeo({
    title: 'Honeymoon Packages',
    description:
      'Explore honeymoon packages crafted by HoneybeeTrips with romantic stays and curated experiences.',
    canonical: '/honeymoon-packages',
    keywords: ['honeymoon packages', 'romantic travel packages', 'custom honeymoon planner'],
    schemas: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Honeymoon Packages',
        url: `${getSiteUrl()}/honeymoon-packages`,
        description:
          'Explore honeymoon packages crafted by HoneybeeTrips with romantic stays and curated experiences.',
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
        titleId="honeymoon-packages-title"
        eyebrow="Romantic Journeys"
        title="Honeymoon Packages"
        subtitle="Pick your preferred style and customize every honeymoon itinerary with our planners."
      />

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-neutral-700">
          From beach retreats to mountain escapes, we design honeymoon packages around your travel pace and interests.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            to="/packages"
            className="rounded-full bg-honey px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:bg-honey-dark"
          >
            View honeymoon packages
          </Link>
          <Link
            to="/contact"
            className="rounded-full border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-900 transition hover:border-honey hover:bg-honey/10"
          >
            Start planning
          </Link>
        </div>
      </div>

      <section className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="font-display text-2xl font-semibold text-neutral-900">Honeymoon package FAQs</h2>
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
