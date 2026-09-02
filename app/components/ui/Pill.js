/**
 * Shared pill-button used anywhere you currently hand-roll:
 *   className="inline-flex items-center gap-2 font-mono text-xs px-4 py-2 rounded-full border ..."
 *
 * Found duplicated (with slightly different classes each time) in:
 *   ProjectLinks, PortalLinks, StudioLink, DocumentList, ResourceList, MoodBoard, GlobalSearch
 *
 * Usage:
 *   <Pill href={previewUrl} icon={TbExternalLink} accent="teal">Live Preview</Pill>
 *   <Pill onClick={...} accent="white">Sign Out</Pill>
 */
import { ACCENTS } from "@/app/utils/variantColors"

export default function Pill({href, onClick, icon: Icon, accent = 'white', children, external = true}) {
  const { bg, text, border, hoverBg } = (ACCENTS[accent] || ACCENTS.white).fill
  const className = `inline-flex items-center gap-2 font-mono text-xs font-medium px-4 py-2 rounded-full border transition-colors ${bg} ${text} ${border} ${hoverBg}`

  const content = (
    <>
      {Icon && <Icon className='text-sm' />}
      {children}
    </>
  )

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className={className}>
        {content}
      </a>
    )
  }

  return (
    <button type='button' onClick={onClick} className={className}>
      {content}
    </button>
  )
}