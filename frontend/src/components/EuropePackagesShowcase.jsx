import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock3, ArrowUpRight } from 'lucide-react'
import { fetchFeaturedPackages, mediaUrl } from '../api/adminPublic'
import { normalizeSlug } from '../components/package-detail/luxuryHelpers'

export function EuropePackagesShowcase() {
  const [packages, setPackages] = useState(null)

  useEffect(() => {
    let alive = true
    fetchFeaturedPackages()
      .then((rows) => {
        if (!alive) return
        setPackages(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setPackages([])
      })
    return () => {
      alive = false
    }
  }, [])

  const featuredPackages = useMemo(
    () =>
      (packages || [])
        .slice(0, 6)
        .map((p) => ({
          id: p.slug || String(p.id),
          href: `/packages/${normalizeSlug(p.slug || p.title || p.id)}`,
          title: p.title,
          days: p.duration || 'Custom duration',
          route: p.location || 'Curated route',
          price: `INR ${Number(p.price || 0).toLocaleString('en-IN')}`,
          image:
            mediaUrl(p.image_path) ||
            mediaUrl(p.cover_image) ||
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80&auto=format&fit=crop',
        })),
    [packages]
  )
  const visibleFeaturedPackages = featuredPackages

  return (
    <section
      className="bg-gradient-to-br from-amber-50 via-[#fffaf0] to-emerald-50/40 py-14 lg:py-20"
      aria-labelledby="featured-packages-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">HoneyBee Picks</p>
            <h2 id="featured-packages-heading" className="mt-2 font-display text-3xl font-semibold text-slate-900 sm:text-4xl">
              HoneyBee Picks curated from admin
            </h2>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Manage this section using the HoneyBee Pick toggle in your admin packages.
            </p>
          </div>
          <Link
            to="/packages"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-300/70 bg-white/70 px-5 py-2.5 text-sm font-semibold text-slate-800 backdrop-blur transition hover:border-emerald-300 hover:text-emerald-700"
          >
            View all packages
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {packages === null && <p className="mt-8 text-sm text-slate-600">Loading HoneyBee Picks...</p>}
        {packages !== null && visibleFeaturedPackages.length === 0 && (
          <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-600">
            No HoneyBee Pick packages yet. Mark packages as featured in admin.
          </p>
        )}
        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleFeaturedPackages.map((pkg) => (
            <Link
              key={pkg.id}
              to={pkg.href}
              className="group block overflow-hidden rounded-2xl border border-amber-100 bg-white/95 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.45)] backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-300"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
                <p className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-slate-900">
                  {pkg.price}
                </p>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold text-slate-900 group-hover:text-emerald-800">{pkg.title}</h3>

                <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Clock3 className="h-4 w-4 text-slate-500" />
                    {pkg.days}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-slate-500" />
                    {pkg.route}
                  </p>
                </div>

                <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50/70 px-4 py-2 text-sm font-semibold text-slate-800 transition group-hover:border-emerald-300 group-hover:text-emerald-700">
                  View package
                  <ArrowUpRight className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
