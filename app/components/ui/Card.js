import Link from 'next/link'

export default function Card({href, onMouseEnter, selected, children, className = ''}) {
  const base = 'block rounded-xl border px-6 py-4 transition-colors'
  const state = selected
    ? 'bg-white/10 border-white/30'
    : 'bg-white/5 hover:bg-white/10 border-white/10'

  if (href) {
    return (
      <Link href={href} onMouseEnter={onMouseEnter} className={`${base} ${state} ${className}`}>
        {children}
      </Link>
    )
  }

  return (
    <div onMouseEnter={onMouseEnter} className={`${base} ${state} ${className}`}>
      {children}
    </div>
  )
}