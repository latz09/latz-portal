import Link from 'next/link'

export default function Card({href, onMouseEnter, selected, children, className = ''}) {
  const base = 'block rounded-r border-l border-white/20  px-6 py-4 font-mono transition-colors'
  const state = selected
    ? 'bg-white/10 shadow-white border-teal opacity-100 '
    : 'bg-white/0 hover:bg-white/10 md:opacity-70 hover:opacity-100  '

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