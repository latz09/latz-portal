import {TbExternalLink, TbBrandFigma, TbDatabase, TbBrandVercel, TbTool} from 'react-icons/tb'
import {BsClaude} from 'react-icons/bs'
import Pill from '@/app/components/ui/Pill'

// Same link every project — not project-specific, so it isn't in Sanity.
// Update the URL here if the Build Companion ever moves.
const BUILD_COMPANION_URL = 'https://claude.ai/project/01a05e56-0098-7153-a932-838649e42136'

const links = {
  internal: ['ai', 'preview', 'figma', 'studio', 'vercel', 'buildCompanion'],
  designer: ['preview', 'figma'],
  client: ['preview'],
}

const config = {
  preview: {label: 'Live Preview', icon: TbExternalLink, accent: 'teal'},
  figma: {label: 'Figma', icon: TbBrandFigma, accent: 'purple'},
  studio: {label: 'Sanity Studio', icon: TbDatabase, accent: 'white'},
  vercel: {label: 'Vercel', icon: TbBrandVercel, accent: 'white'},
  buildCompanion: {label: 'Build Assistant', icon: TbTool, accent: 'danger'},
   ai: {label: 'Client Intel', icon: BsClaude, accent: 'warning'},
}

export default function ProjectLinks({variant, previewUrl, figmaUrl, studioUrl, vercelUrl, aiProjectLink}) {
  const urls = {
    preview: previewUrl,
    figma: figmaUrl,
    studio: studioUrl,
    vercel: vercelUrl,
    buildCompanion: BUILD_COMPANION_URL,
    ai: aiProjectLink,
  }
  const available = links[variant].filter((key) => urls[key])
  if (!available.length) return null

  return (
    <div className='flex flex-wrap gap-2 mt-10 mb-16'>
      {available.map((key) => {
        const {label, icon, accent} = config[key]
        return (
          <Pill key={key} href={urls[key]} icon={icon} accent={accent}>
            {label}
          </Pill>
        )
      })}
    </div>
  )
}