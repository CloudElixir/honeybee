import { useEffect } from 'react'
import { getSiteUrl } from '../lib/siteUrl'

const defaultTitle = 'HoneybeeTrips — Luxury Travel & Curated Journeys'
const defaultDesc =
  'HoneybeeTrips — curated luxury travel, honeymoons, and bespoke journeys worldwide.'

const SEO_ATTR = 'data-hb-seo'

const toAbsoluteUrl = (canonical) => {
  if (!canonical) return null
  if (canonical.startsWith('http://') || canonical.startsWith('https://')) return canonical
  return `${getSiteUrl()}${canonical.startsWith('/') ? canonical : `/${canonical}`}`
}

export function useSeo({ title, description, canonical, keywords, schemas } = {}) {
  useEffect(() => {
    document.title = title ? `${title} | HoneybeeTrips` : defaultTitle
    const meta = document.querySelector('meta[name="description"]')
    if (meta) {
      meta.setAttribute('content', description ?? defaultDesc)
    }

    if (keywords) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]')
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta')
        keywordsMeta.setAttribute('name', 'keywords')
        document.head.appendChild(keywordsMeta)
      }
      const keywordText = Array.isArray(keywords) ? keywords.join(', ') : String(keywords)
      keywordsMeta.setAttribute('content', keywordText)
    }

    const absoluteCanonical = toAbsoluteUrl(canonical)
    if (absoluteCanonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]')
      if (!canonicalLink) {
        canonicalLink = document.createElement('link')
        canonicalLink.setAttribute('rel', 'canonical')
        document.head.appendChild(canonicalLink)
      }
      canonicalLink.setAttribute('href', absoluteCanonical)
    }

    document.querySelectorAll(`script[${SEO_ATTR}="schema"]`).forEach((el) => el.remove())
    if (Array.isArray(schemas)) {
      schemas.forEach((schema) => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute(SEO_ATTR, 'schema')
        script.text = JSON.stringify(schema)
        document.head.appendChild(script)
      })
    }
  }, [title, description, canonical, keywords, schemas])
}
