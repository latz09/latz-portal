import { TbEdit } from 'react-icons/tb'

const CLIENT_BASE = 'https://latz-portal.sanity.studio/structure/client'
const PROJECT_BASE = 'https://latz-portal.sanity.studio/structure/project'

export default function StudioLink({
  id,
  type = 'client',
  label,
  className = '',
}) {
  const base = type === 'project' ? PROJECT_BASE : CLIENT_BASE
  const href = id ? `${base};${id}` : base
  const text = label ?? (id ? 'Edit' : type === 'project' ? 'New Project' : 'New Client')

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-dark font-mono text-xs px-4 py-2 rounded-full border border-white/10 text-white/80 hover:bg-white/5 transition-colors ${className}`}
    >
      <TbEdit className="text-sm" />
      {text}
    </a>
  )
}