import { motion } from 'framer-motion'
import { SectionHeading } from '../components/SectionHeading'
import { useSeo } from '../hooks/useSeo'

const team = [
  {
    name: 'Amelia Hart',
    role: 'Founder & Chief Journey Designer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80',
    bio: 'Former hotel strategist; obsessed with pacing and quiet luxury.',
  },
  {
    name: 'Daniel Okoro',
    role: 'Adventure & Africa Lead',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80',
    bio: 'Expedition logistics, conservation partners, and the right pair of boots.',
  },
  {
    name: 'Sofia Reyes',
    role: 'Concierge Operations',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80',
    bio: 'The voice you hear when plans shift — calm, fast, and precise.',
  },
  {
    name: 'Thomas Müller',
    role: 'Europe & Rail Specialist',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80',
    bio: 'Scenic routes, hidden chalets, and the art of the long lunch.',
  },
]

export function About() {
  useSeo({
    title: 'About Us',
    description: 'HoneybeeTrips mission, vision, and the team behind your journeys.',
  })

  return (
    <div>
      <div className="relative -mt-20 sm:-mt-24 overflow-hidden pt-20 sm:pt-24">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80"
            alt=""
            className="h-[420px] w-full object-cover sm:h-[480px]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-neutral-900" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="max-w-2xl"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-honey">About us</p>
            <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl text-balance">
              We believe travel should feel golden
            </h1>
            <p className="mt-6 text-lg text-white/85 leading-relaxed">
              HoneybeeTrips began as a small desk and a long list of places worth slowing down for. Today we’re a
              collective of advisors who plan like designers — with warmth, rigor, and a bias for the memorable.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-card"
          >
            <h2 className="font-display text-2xl font-semibold text-neutral-900">Our story</h2>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              The name nods to the honeybee: purposeful, collaborative, and drawn to the good stuff. We don’t sell
              volume — we curate a finite number of trips each season so our partners stay exceptional and our
              travelers never feel like a queue number.
            </p>
            <p className="mt-4 text-neutral-600 leading-relaxed">
              From first conversation to touchdown at home, you’ll work with humans who’ve walked the routes,
              slept in the beds, and met the guides. That’s the HoneybeeTrips difference.
            </p>
          </motion.section>

          <div className="grid gap-6 sm:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.05 }}
              className="rounded-2xl bg-neutral-900 p-8 text-white"
            >
              <h2 className="font-display text-xl font-semibold text-honey">Mission</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/80">
                To design travel that restores — through beautiful pacing, trusted partners, and advisors who pick up
                the phone.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-neutral-200 p-8"
            >
              <h2 className="font-display text-xl font-semibold text-neutral-900">Vision</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                A world where “luxury” means attention, not excess — and every itinerary leaves room for wonder.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="mt-20">
          <SectionHeading
            titleId="team-heading"
            eyebrow="People"
            title="Meet the hive"
            subtitle="Small team, senior expertise — you’ll know us by name."
          />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-card"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={member.image}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <h3 className="font-display text-lg font-semibold text-neutral-900">{member.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gold">{member.role}</p>
                  <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{member.bio}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
