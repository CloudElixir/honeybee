import { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { fetchBlogs } from '../api/adminPublic'
import { useSeo } from '../hooks/useSeo'

export function Blogs() {
  useSeo({
    title: 'Travel Blogs',
    description: 'Read latest HoneyBeeTrips destination guides, planning tips, and travel inspiration.',
  })

  const [blogs, setBlogs] = useState([])

  useEffect(() => {
    let alive = true
    fetchBlogs()
      .then((rows) => {
        if (!alive) return
        setBlogs(Array.isArray(rows) ? rows : [])
      })
      .catch(() => {
        if (!alive) return
        setBlogs([])
      })
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-honey">HoneyBeeTrips journal</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 sm:text-5xl">Travel Blogs</h1>
        <p className="mt-3 text-neutral-600">
          Practical planning guides, destination comparisons, and insider travel tips from our team.
        </p>
      </div>

      {blogs.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-10 text-center text-neutral-600">
          No blogs published yet. Add posts from admin panel.
        </p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogs.map((b) => (
            <article key={b.id} className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
              <div className="relative aspect-[16/9] bg-neutral-100">
                <img
                  src={
                    (Array.isArray(b.image_paths) && b.image_paths[0]) ||
                    b.cover_image ||
                    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80'
                  }
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-5">
                <h2 className="text-lg font-semibold text-neutral-900">{b.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {b.excerpt || String(b.content || '').slice(0, 140)}
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
                  <CalendarDays className="h-4 w-4" />
                  {b.created_at ? new Date(b.created_at).toLocaleDateString() : 'Recently published'}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

