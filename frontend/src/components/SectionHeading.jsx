import { motion } from 'framer-motion'

export function SectionHeading({ eyebrow, title, subtitle, align = 'center', titleId }) {
  const alignClass =
    align === 'left' ? 'text-left items-start' : 'text-center items-center mx-auto'

  return (
    <motion.div
      className={`mb-12 flex max-w-3xl flex-col gap-3 ${alignClass}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      {eyebrow && (
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</span>
      )}
      <h2
        id={titleId}
        className="font-display text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl md:text-[2.75rem] text-balance"
      >
        {title}
      </h2>
      {subtitle && <p className="text-neutral-600 text-balance leading-relaxed">{subtitle}</p>}
    </motion.div>
  )
}
