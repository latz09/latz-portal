'use client'

import { useState } from 'react'
import {
  TbLayoutDashboard, TbFileText, TbPencil, TbLayout, TbBook, TbCopy, TbCheck,
  TbBrandNotion, TbBrandGoogleDrive, TbBrandPinterest, TbVideo, TbLink, TbBrandFigma,
} from 'react-icons/tb'
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

const resourceIcon = {
  'google-drive': TbBrandGoogleDrive,
  figma: TbBrandFigma,
  notion: TbBrandNotion,
  video: TbVideo,
  pinterest: TbBrandPinterest,
  other: TbLink,
}

const UNCATEGORIZED = 'uncategorized'

export const FULL_GROUPS = [
  { label: 'Overview', match: ['overview'] },
  { label: 'Design', match: ['design'] },
  { label: 'Technical', match: ['technical'] },
  { label: 'Other', match: ['other', UNCATEGORIZED] },
]

export const DESIGNER_GROUPS = [
  { label: 'Overview', match: ['overview'] },
  { label: 'Design', match: ['design'] },
  { label: 'Additional', match: ['technical', 'other', UNCATEGORIZED] },
]

export default function ProjectAssets({
  variant, docs, resources, inspiration, clientSlug, projectSlug, groups = FULL_GROUPS,
}) {
  const s = variantStyles[variant]
  const [copiedKey, setCopiedKey] = useState(null)

  const handleCopy = (e, filename) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/clients/${clientSlug}/${projectSlug}/${filename}`
    navigator.clipboard.writeText(url)
    setCopiedKey(filename)
    setTimeout(() => setCopiedKey((k) => (k === filename ? null : k)), 5000)
  }

  const docItems = (docs || []).map((doc, i) => ({
    key: `doc-${i}`,
    kind: 'doc',
    label: doc.label,
    category: doc.category || UNCATEGORIZED,
    audience: doc.audience,
    icon: docIcon[doc.filename] ?? TbFileText,
    href: `/view/${clientSlug}/${projectSlug}/${doc.filename}?ref=${variant}`,
    filename: doc.filename,
  }))

  const resourceItems = (resources || []).map((res, i) => ({
    key: `resource-${i}`,
    kind: 'resource',
    label: res.label,
    category: res.category || UNCATEGORIZED,
    audience: res.audience,
    icon: resourceIcon[res.type] ?? TbLink,
    href: res.url,
  }))

  const allItems = [...docItems, ...resourceItems]

  if (allItems.length === 0 && !inspiration?.length) return null

  return (
    <div className='mb-10'>
      {groups.map(group => {
        const items = allItems.filter(item => group.match.includes(item.category))
        if (items.length === 0) return null
        return (
          <div key={group.label} className='mb-8'>
            <p className='font-mono text-[10px] lg:text-xs text-white/40 tracking-widest uppercase mb-4'>
              {group.label}
            </p>
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
              {items.map(item => {
                const Icon = item.icon
                const isDoc = item.kind === 'doc'
                const isCopied = copiedKey === item.filename
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    target={isDoc ? undefined : '_blank'}
                    rel={isDoc ? undefined : 'noopener noreferrer'}
                    className='group relative flex flex-col bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] rounded-xl p-4 min-h-40 lg:min-h-44 transition-colors'
                  >
                    {isDoc && variant === 'internal' && (
                      <button
                        type='button'
                        onClick={(e) => handleCopy(e, item.filename)}
                        title='Copy static file link'
                        className={`absolute top-3 right-3 p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all ${
                          isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                      >
                        {isCopied ? <TbCheck className='text-base text-warning' /> : <TbCopy className='text-base' />}
                      </button>
                    )}
                    <Icon className={`text-2xl ${s.icon} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`} />
                    <div className='flex flex-col justify-end flex-1 gap-2 mt-auto pt-4'>
                      <span className='font-medium text-sm text-white leading-tight'>{item.label}</span>
                      {variant === 'internal' && (
                        <div className='flex flex-wrap gap-1.5'>
                          {item.audience?.map(a => (
                            <span key={a} className={`font-mono text-[10px] uppercase tracking-wide ${audienceBadge[a]}`}>
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
      })}
      {inspiration?.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
          <MoodBoard inspiration={inspiration} variant={variant} />
        </div>
      )}
    </div>
  )
}