import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, ArrowUpRight } from 'lucide-react'
import { mediaUrl } from '../api/adminPublic'

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function DestinationCard({ destination, index = 0 }) {
  const { id, title, location, priceFrom, shortDescription, image, duration } = destination
  const destinationSlug = destination.slug || slugify(destination.title) || id

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative overflow-hidden rounded-2xl bg-white shadow-card"
    >
      <Link
        to={`/destinations/${destinationSlug}`}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-honey focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={mediaUrl(image) || image}
            alt={`${title}, ${location}`}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
            <div className="flex items-center gap-1.5 text-xs font-medium text-white/90">
              <MapPin className="h-3.5 w-3.5 text-honey" />
              {location}
            </div>
            <h3 className="mt-1 font-display text-2xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 line-clamp-2 text-sm text-white/85">{shortDescription}</p>
          </div>
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm">
            {duration}
          </span>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-neutral-500">From</p>
            <p className="text-lg font-semibold text-neutral-900">
              ${priceFrom.toLocaleString()}
              <span className="text-sm font-normal text-neutral-500"> / person</span>
            </p>
          </div>
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-honey/15 text-neutral-900 transition group-hover:bg-honey">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
