import { TbBrandNotion, TbBrandGoogleDrive, TbBrandPinterest, TbVideo, TbLink } from 'react-icons/tb'

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

const typeIcon = {
  'google-drive': TbBrandGoogleDrive,
  'notion':       TbBrandNotion,
  'video':        TbVideo,
  'pinterest':    TbBrandPinterest,
  'other':        TbLink,
}

export default function ResourceList({ variant, resources }) {
  if (!resources?.length) return null
  const s = variantStyles[variant]

  return (
    <div className='mb-10'>
      <p className='font-mono text-[10px] lg:text-xs text-white/40 tracking-widest uppercase mb-4'>
        Additional Resources
      </p>
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
        {resources.map((resource, i) => {
          const Icon = typeIcon[resource.type] ?? TbLink
          return (
            <a
              key={i}
              href={resource.url}
              target='_blank'
              rel='noopener noreferrer'
              className='group flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl p-4 min-h-40 lg:min-h-44 transition-colors'
            >
              <Icon className={`text-2xl ${s.icon} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />
              <div className='flex flex-col justify-end flex-1 gap-2 mt-auto pt-4'>
                <span className='font-medium text-sm text-white leading-tight'>{resource.label}</span>
                {variant === 'internal' && (
                  <div className='flex flex-wrap gap-1.5'>
                    {resource.audience?.map(a => (
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
      </div>
    </div>
  )
}