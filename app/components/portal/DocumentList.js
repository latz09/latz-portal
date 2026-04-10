import { TbLayoutDashboard, TbFileText, TbPencil, TbLayout, TbBook } from 'react-icons/tb'
import MoodBoard from './MoodBoard'

const variantStyles = {
  internal: { icon: 'text-teal'   },
  designer: { icon: 'text-purple' },
  client:   { icon: 'text-teal'   },
}

const audienceBadge = {
  internal: 'bg-teal/20 text-teal',
  designer: 'bg-purple/20 text-purple',
  client:   'bg-warning/20 text-warning',
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
    <div>
      <p className="font-mono text-xs lg:text-base text-white/60 tracking-widest uppercase mb-4">
        Documents
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {docs.map(doc => {
          const Icon = docIcon[doc.filename] ?? TbFileText
          return (
            <a
              key={doc.filename}
             href={`/view/${clientSlug}/${projectSlug}/${doc.filename}?ref=${variant}`}
              className="flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 min-h-40 lg:min-h-44 transition-colors"
            >
              <Icon className={`text-2xl ${s.icon} shrink-0`} />
              <div className="flex flex-col justify-end flex-1 gap-2 mt-auto pt-4">
                <span className="font-medium text-sm leading-tight">{doc.label}</span>
                {variant === 'internal' && (
                  <div className="flex flex-wrap gap-1">
                    {doc.audience.map(a => (
                      <span
                        key={a}
                        className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${audienceBadge[a]}`}
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