import { TbLayoutDashboard, TbFileText, TbPencil, TbLayout, TbBook } from 'react-icons/tb'
import MoodBoard from './MoodBoard'

const variantStyles = {
  internal: { icon: 'text-teal' },
  designer: { icon: 'text-purple' },
  client:   { icon: 'text-teal' },
}

const audienceBadge = {
  internal: 'text-teal',
  designer: 'text-purple',
  client:   'text-warning',
}

const docIcon = {
  'overview.html':    TbLayoutDashboard,
  'proposal.html':    TbFileText,
  'designBrief.html': TbPencil,
  'wireframe.html':   TbLayout,
  'cms-guide.html':   TbBook,
}

export default function DocumentList({ variant, docs, clientSlug, projectSlug, inspiration }) {
  const s = variantStyles[variant]

  return (
    <div className='mb-10'>
      <p className='font-mono text-[10px] lg:text-xs text-white/40 tracking-widest uppercase mb-4'>
        Documents
      </p>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
        {docs.map(doc => {
          const Icon = docIcon[doc.filename] ?? TbFileText
          return (
            <a
              key={doc.filename}
              href={`/view/${clientSlug}/${projectSlug}/${doc.filename}?ref=${variant}`}
              className='group flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl p-4 min-h-40 lg:min-h-44 transition-colors'
            >
              <Icon className={`text-2xl ${s.icon} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className='flex flex-col justify-end flex-1 gap-2 mt-auto pt-4'>
                <span className='font-medium text-sm text-white leading-tight'>{doc.label}</span>
                {variant === 'internal' && (
                  <div className='flex flex-wrap gap-1.5'>
                    {doc.audience.map(a => (
                      <span
                        key={a}
                        className={`font-mono text-[10px] uppercase tracking-wide ${audienceBadge[a]}`}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </a>
          )
        })}
        {inspiration?.length > 0 && (
          <MoodBoard inspiration={inspiration} variant={variant} />
        )}
      </div>
    </div>
  )
}