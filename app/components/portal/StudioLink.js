import { TbEdit } from 'react-icons/tb'

const BASE = 'https://latz-portal.sanity.studio/structure'

export default function StudioLink({ id }) {
  const href = id ? `${BASE}/client;${id}` : BASE

  return (
    <a
      href={href}
      target="_blank"
      className="inline-flex items-center gap-2 bg-dark font-mono text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:bg-white/5 transition-colors"
    >
      <TbEdit className="text-sm" />
      {id ? 'Edit in Studio' : 'Edit Portal'}
    </a>
  )
}