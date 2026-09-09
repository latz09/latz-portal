'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  TbExternalLink,
  TbBrandFigma,
  TbDatabase,
  TbBrandVercel,
  TbTool,
  TbPencil,
  TbCheck,
  TbX,
} from 'react-icons/tb'
import { BsClaude } from 'react-icons/bs'
import Pill from '@/app/components/ui/Pill'

const BUILD_COMPANION_URL = 'https://claude.ai/project/01a05e56-0098-7153-a932-838649e42136'

const links = {
  internal: ['ai', 'preview', 'figma', 'studio', 'vercel', 'buildCompanion'],
  designer: ['preview', 'figma'],
  client: ['preview'],
}

const config = {
  preview: { label: 'Live Preview', icon: TbExternalLink, accent: 'teal', field: 'previewUrl' },
  figma: { label: 'Figma', icon: TbBrandFigma, accent: 'purple', field: 'figmaUrl' },
  studio: { label: 'Sanity Studio', icon: TbDatabase, accent: 'white', field: 'studioUrl' },
  vercel: { label: 'Vercel', icon: TbBrandVercel, accent: 'white', field: 'vercelUrl' },
  buildCompanion: { label: 'Build Assistant', icon: TbTool, accent: 'danger' },
  ai: { label: 'Client Intel', icon: BsClaude, accent: 'warning', field: 'aiProjectLink' },
}

function normalizeUrl(raw) {
  const trimmed = raw.trim()
  if (!trimmed) return ''
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const parsed = new URL(withScheme)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    return withScheme
  } catch {
    return null
  }
}

export default function ProjectLinks({
  variant,
  projectId,
  previewUrl,
  figmaUrl,
  studioUrl,
  vercelUrl,
  aiProjectLink,
}) {
  const router = useRouter()
  const [urls, setUrls] = useState({
    preview: previewUrl,
    figma: figmaUrl,
    studio: studioUrl,
    vercel: vercelUrl,
    buildCompanion: BUILD_COMPANION_URL,
    ai: aiProjectLink,
  })
  const [editingKey, setEditingKey] = useState(null)
  const [draft, setDraft] = useState('')
  const [editError, setEditError] = useState('')

  const editable = variant === 'internal'
  const keys = editable ? links[variant] : links[variant].filter((key) => urls[key])
  if (!keys.length) return null

  const startEdit = (key) => {
    setDraft(urls[key] || '')
    setEditError('')
    setEditingKey(key)
  }

  const cancelEdit = () => {
    setEditingKey(null)
    setEditError('')
  }

  const save = async (key) => {
    const { field } = config[key]
    if (!field) return

    const value = normalizeUrl(draft)
    if (value === null) {
      setEditError('That doesn\u2019t look like a valid URL')
      return
    }

    const prev = urls[key]
    setUrls((u) => ({ ...u, [key]: value || undefined }))
    setEditingKey(null)
    setEditError('')

    try {
      const res = await fetch(`/api/projects/${projectId}/links`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field, value }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`save failed (${res.status}): ${body}`)
      }
      router.refresh()
    } catch (err) {
      console.error(err)
      setUrls((u) => ({ ...u, [key]: prev }))
    }
  }

  return (
    <div className='flex flex-wrap gap-2 mt-10 mb-16 items-start'>
      {keys.map((key) => {
        const { label, icon: Icon, accent, field } = config[key]
        const url = urls[key]
        const canEdit = editable && field

        if (editingKey === key) {
          return (
            <div key={key} className='flex flex-col gap-1'>
              <div className='flex items-center gap-1.5 bg-white/[0.04] border border-teal/40 rounded-xl pl-3 pr-1.5 py-1.5'>
                <Icon size={14} className='text-white/40 shrink-0' />
                <input
                  autoFocus
                  type='text'
                  inputMode='url'
                  value={draft}
                  onChange={(e) => {
                    setDraft(e.target.value)
                    if (editError) setEditError('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save(key)
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  placeholder={`${label} URL`}
                  className='bg-transparent outline-none text-sm text-white/90 placeholder:text-white/30 w-44 sm:w-56'
                />
                <button onClick={() => save(key)} className='text-teal hover:text-teal/70 p-1' aria-label='Save'>
                  <TbCheck size={15} />
                </button>
                <button onClick={cancelEdit} className='text-white/40 hover:text-white/70 p-1' aria-label='Cancel'>
                  <TbX size={15} />
                </button>
              </div>
              {editError && <span className='text-[11px] text-danger pl-1'>{editError}</span>}
            </div>
          )
        }

        if (!url) {
          return (
            <button
              key={key}
              type='button'
              onClick={() => canEdit && startEdit(key)}
              disabled={!canEdit}
              className='flex items-center gap-1.5 rounded-xl border border-white/[0.08] px-3 py-1.5 text-sm text-white/25 hover:text-white/45 hover:border-white/[0.15] transition-colors disabled:cursor-default disabled:hover:text-white/25 disabled:hover:border-white/[0.08]'
            >
              <Icon size={14} />
              {label}
            </button>
          )
        }

        return (
          <div key={key} className='group relative'>
            <Pill href={url} icon={Icon} accent={accent}>
              {label}
            </Pill>
            {canEdit && (
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  startEdit(key)
                }}
                aria-label={`Edit ${label} link`}
                className='absolute -top-1.5 -right-1.5 z-10 p-2.5 -m-2.5 touch-manipulation'
              >
                <span className='flex items-center justify-center w-4 h-4 bg-white/30 border border-teal rounded-full text-dark transition duration-300 group-hover:bg-white lg:group-hover:-translate-y-2 group-hover:text-dark'>
                  <TbPencil size={10} />
                </span>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}