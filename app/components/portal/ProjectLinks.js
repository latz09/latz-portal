import {TbExternalLink, TbBrandFigma, TbDatabase, TbBrandVercel} from 'react-icons/tb'
import {BsClaude} from 'react-icons/bs'
import Pill from '@/app/components/ui/Pill'

const links = {
  internal: ['preview', 'figma', 'studio', 'vercel', 'ai'],
  designer: ['preview', 'figma'],
  client: ['preview'],
}

const config = {
  preview: {label: 'Live Preview', icon: TbExternalLink, accent: 'teal'},
  figma: {label: 'Figma', icon: TbBrandFigma, accent: 'purple'},
  studio: {label: 'Sanity Studio', icon: TbDatabase, accent: 'white'},
  vercel: {label: 'Vercel', icon: TbBrandVercel, accent: 'white'},
  ai: {label: 'AI', icon: BsClaude, accent: 'white'},
}

export default function ProjectLinks({variant, previewUrl, figmaUrl, studioUrl, vercelUrl, aiProjectLink}) {
  const urls = {preview: previewUrl, figma: figmaUrl, studio: studioUrl, vercel: vercelUrl, ai: aiProjectLink}
  const available = links[variant].filter((key) => urls[key])
  if (!available.length) return null

  return (
    <div className='flex flex-wrap gap-2 mb-10'>
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