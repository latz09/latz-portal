import { TbExternalLink, TbBrandFigma, TbDatabase, TbBrandVercel } from 'react-icons/tb'

const links = {
  internal: ['preview', 'figma', 'studio', 'vercel'],
  designer: ['preview', 'figma'],
  client:   ['preview'],
}

const config = {
  preview: { label: 'Live Preview',  icon: TbExternalLink, color: 'text-teal     border-teal/30   hover:bg-teal/10'   },
  figma:   { label: 'Figma',         icon: TbBrandFigma,   color: 'text-purple   border-purple/30 hover:bg-purple/10' },
  studio:  { label: 'Sanity Studio', icon: TbDatabase,     color: 'text-white/50 border-white/10  hover:bg-white/5'   },
  vercel:  { label: 'Vercel',        icon: TbBrandVercel,  color: 'text-white/50 border-white/10  hover:bg-white/5'   },
}

export default function ProjectLinks({ variant, previewUrl, figmaUrl, studioUrl, vercelUrl }) {
  const urls = { preview: previewUrl, figma: figmaUrl, studio: studioUrl, vercel: vercelUrl }
  const allowed = links[variant]

  const available = allowed.filter(key => urls[key])
  if (!available.length) return null

  return (
    <div className="flex flex-wrap gap-2 mb-10">
      {available.map(key => {
        const { label, icon: Icon, color } = config[key]
        return (
          <a
            key={key}
            href={urls[key]}
            target="_blank"
            className={`inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full border transition-colors ${color}`}
          >
            <Icon className="text-sm" />
            {label}
          </a>
        )
      })}
    </div>
  )
}