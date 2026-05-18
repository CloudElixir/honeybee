import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v))
}

export function ScrollArrows() {
  const [y, setY] = useState(0)
  const [maxY, setMaxY] = useState(0)

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const max = Math.max(0, doc.scrollHeight - window.innerHeight)
      setY(window.scrollY || doc.scrollTop || 0)
      setMaxY(max)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const atTop = y < 8
  const atBottom = y > maxY - 8

  const canScroll = useMemo(() => maxY > 24, [maxY])

  const scrollByAmount = (dir) => {
    const amount = Math.round(window.innerHeight * 0.82)
    const next = clamp(y + dir * amount, 0, maxY)
    window.scrollTo({ top: next, behavior: 'smooth' })
  }

  if (!canScroll) return null

  return (
    <div className="fixed right-5 top-1/2 z-[90] hidden -translate-y-1/2 flex-col items-center gap-2 md:flex">
      <button
        type="button"
        onClick={() => scrollByAmount(-1)}
        disabled={atTop}
        className={`group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-honey/30 ${
          atTop ? 'pointer-events-none opacity-30' : 'opacity-80 hover:opacity-100'
        }`}
        aria-label="Scroll up"
        title="Scroll up"
      >
        <ChevronUp className="h-5 w-5 transition group-hover:-translate-y-0.5" />
      </button>

      <button
        type="button"
        onClick={() => scrollByAmount(1)}
        disabled={atBottom}
        className={`group inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white backdrop-blur transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-honey/30 ${
          atBottom ? 'pointer-events-none opacity-30' : 'opacity-80 hover:opacity-100'
        }`}
        aria-label="Scroll down"
        title="Scroll down"
      >
        <ChevronDown className="h-5 w-5 transition group-hover:translate-y-0.5" />
      </button>
    </div>
  )
}

