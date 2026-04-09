import { TbBrandNotion, TbBrandGoogleDrive, TbVideo, TbLink } from 'react-icons/tb'

const variantStyles = {
  internal: { icon: 'text-teal', badge: 'bg-teal/20 text-teal' },
  designer: { icon: 'text-purple', badge: 'bg-purple/20 text-purple' },
  client:   { icon: 'text-teal', badge: 'bg-teal/20 text-teal' },
}

const audienceBadge = {
  internal: 'bg-teal/20 text-teal',
  designer: 'bg-purple/20 text-purple',
  client:   'bg-warning/20 text-warning',
}

const typeIcon = {
  'google-drive': TbBrandGoogleDrive,
  'notion':       TbBrandNotion,
  'video':        TbVideo,
  'other':        TbLink,
}

export default function ResourceList({ variant, resources }) {
  if (!resources?.length) return null

  return (
    <div className='mt-10'>
      <p className='font-mono text-xs text-white/30 tracking-widest uppercase mb-4'>
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
              className='flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 min-h-40 lg:min-h-44 transition-colors'
            >
              <Icon className={`text-2xl ${variantStyles[variant].icon} shrink-0`} />
              <div className='flex flex-col justify-end flex-1 gap-2 mt-auto pt-4'>
                <span className='font-medium text-sm leading-tight'>{resource.label}</span>
                {variant === 'internal' && (
                  <div className='flex flex-wrap gap-1'>
                    {resource.audience?.map(a => (
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
      </div>
    </div>
  )
}