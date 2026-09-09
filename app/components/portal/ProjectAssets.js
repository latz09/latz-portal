'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  TbLayoutDashboard, TbFileText, TbPencil, TbLayout, TbBook, TbCopy, TbCheck,
  TbBrandNotion, TbBrandGoogleDrive, TbBrandPinterest, TbVideo, TbLink, TbBrandFigma,
  TbWorld, TbPlus,
} from 'react-icons/tb'
import MoodBoard from './MoodBoard'
import DocForm from './DocForm'
import ResourceForm from './ResourceForm'

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
  link: TbWorld,
  other: TbLink,
}

const UNCATEGORIZED = 'uncategorized'

export const FULL_GROUPS = [
  { label: 'Overview', match: ['overview'] },
  { label: 'Design', match: ['design'] },
  { label: 'Handoff', match: ['handoff'] },
  { label: 'Technical', match: ['technical'] },
  { label: 'Other', match: ['other', UNCATEGORIZED] },
]

export const DESIGNER_GROUPS = [
  { label: 'Overview', match: ['overview'] },
  { label: 'Design', match: ['design'] },
  { label: 'Additional', match: ['handoff', 'technical', 'other', UNCATEGORIZED] },
]

export default function ProjectAssets({
  variant, docs, resources, inspiration, clientSlug, projectSlug, projectId, groups = FULL_GROUPS,
}) {
  const router = useRouter()
  const s = variantStyles[variant]
  const [copiedKey, setCopiedKey] = useState(null)

  const [docsState, setDocsState] = useState(docs || [])
  const [addDocOpen, setAddDocOpen] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)

  const [resourcesState, setResourcesState] = useState(resources || [])
  const [addResourceOpen, setAddResourceOpen] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  useEffect(() => {
    setDocsState(docs || [])
  }, [docs])

  useEffect(() => {
    setResourcesState(resources || [])
  }, [resources])

  const handleCopy = (e, filename) => {
    e.preventDefault()
    e.stopPropagation()
    const url = `${window.location.origin}/clients/${clientSlug}/${projectSlug}/${filename}`
    navigator.clipboard.writeText(url)
    setCopiedKey(filename)
    setTimeout(() => setCopiedKey((k) => (k === filename ? null : k)), 5000)
  }

  // Docs

  const handleDocEditClick = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingDoc({
      _key: item.key,
      label: item.label,
      filename: item.filename,
      category: item.category === UNCATEGORIZED ? 'other' : item.category,
      audience: item.audience || [],
    })
  }

  const closeDocForm = () => {
    setAddDocOpen(false)
    setEditingDoc(null)
  }

  const handleAddDoc = async (doc) => {
    const res = await fetch(`/api/projects/${projectId}/docs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to add document')
    }
    const { doc: savedDoc } = await res.json()
    setDocsState((d) => [...d, savedDoc])
    closeDocForm()
    router.refresh()
  }

  const handleEditDoc = async (payload) => {
    const res = await fetch(`/api/projects/${projectId}/docs`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to update document')
    }
    const { doc: savedDoc } = await res.json()
    setDocsState((d) => d.map((doc) => (doc._key === savedDoc._key ? savedDoc : doc)))
    closeDocForm()
    router.refresh()
  }

  const handleDeleteDoc = async (key) => {
    const res = await fetch(`/api/projects/${projectId}/docs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to delete document')
    }
    setDocsState((d) => d.filter((doc) => doc._key !== key))
    closeDocForm()
    router.refresh()
  }

  // Resources

  const handleResourceEditClick = (e, item) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingResource({
      _key: item.key,
      label: item.label,
      url: item.href,
      type: item.type,
      category: item.category === UNCATEGORIZED ? 'other' : item.category,
      audience: item.audience || [],
    })
  }

  const closeResourceForm = () => {
    setAddResourceOpen(false)
    setEditingResource(null)
  }

  const handleAddResource = async (resource) => {
    const res = await fetch(`/api/projects/${projectId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resource),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to add resource')
    }
    const { resource: saved } = await res.json()
    setResourcesState((r) => [...r, saved])
    closeResourceForm()
    router.refresh()
  }

  const handleEditResource = async (payload) => {
    const res = await fetch(`/api/projects/${projectId}/resources`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to update resource')
    }
    const { resource: saved } = await res.json()
    setResourcesState((r) => r.map((item) => (item._key === saved._key ? saved : item)))
    closeResourceForm()
    router.refresh()
  }

  const handleDeleteResource = async (key) => {
    const res = await fetch(`/api/projects/${projectId}/resources`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key }),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.error || 'Failed to delete resource')
    }
    setResourcesState((r) => r.filter((item) => item._key !== key))
    closeResourceForm()
    router.refresh()
  }

  const docItems = (docsState || []).map((doc, i) => ({
    key: doc._key || `doc-${i}`,
    kind: 'doc',
    label: doc.label,
    category: doc.category || UNCATEGORIZED,
    audience: doc.audience,
    icon: docIcon[doc.filename] ?? TbFileText,
    href: `/view/${clientSlug}/${projectSlug}/${doc.filename}?ref=${variant}`,
    filename: doc.filename,
  }))

  const resourceItems = (resourcesState || []).map((res, i) => ({
    key: res._key || `resource-${i}`,
    kind: 'resource',
    label: res.label,
    category: res.category || UNCATEGORIZED,
    audience: res.audience,
    icon: resourceIcon[res.type] ?? TbLink,
    href: res.url,
    type: res.type,
  }))

  const allItems = [...docItems, ...resourceItems]

  if (allItems.length === 0 && !inspiration?.length && variant !== 'internal') return null

  return (
    <div className='mb-16'>
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
                    {variant === 'internal' && (
                      <div className='absolute top-3 right-3 flex items-center gap-1'>
                        <button
                          type='button'
                          onClick={(e) => (isDoc ? handleDocEditClick(e, item) : handleResourceEditClick(e, item))}
                          title={isDoc ? 'Edit document' : 'Edit resource'}
                          className='p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all opacity-40 lg:opacity-0 lg:group-hover:opacity-100'
                        >
                          <TbPencil className='text-base' />
                        </button>
                        {isDoc && (
                          <button
                            type='button'
                            onClick={(e) => handleCopy(e, item.filename)}
                            title='Copy static file link'
                            className={`p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all ${
                              isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isCopied ? <TbCheck className='text-base text-warning' /> : <TbCopy className='text-base' />}
                          </button>
                        )}
                      </div>
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

      {variant === 'internal' && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8'>
          <button
            type='button'
            onClick={() => setAddDocOpen(true)}
            className='flex flex-col items-center justify-center gap-2 border border-dashed border-white/[0.12] rounded-xl p-4 min-h-40 lg:min-h-44 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors'
          >
            <TbPlus className='text-2xl' />
            <span className='text-sm font-medium'>Add Document</span>
          </button>
          <button
            type='button'
            onClick={() => setAddResourceOpen(true)}
            className='flex flex-col items-center justify-center gap-2 border border-dashed border-white/[0.12] rounded-xl p-4 min-h-40 lg:min-h-44 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors'
          >
            <TbPlus className='text-2xl' />
            <span className='text-sm font-medium'>Add Resource</span>
          </button>
        </div>
      )}

      {inspiration?.length > 0 && (
        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
          <MoodBoard inspiration={inspiration} variant={variant} />
        </div>
      )}

      {(addDocOpen || editingDoc) && (
        <DocForm
          initialDoc={editingDoc}
          onClose={closeDocForm}
          onSave={editingDoc ? handleEditDoc : handleAddDoc}
          onDelete={editingDoc ? handleDeleteDoc : undefined}
        />
      )}

      {(addResourceOpen || editingResource) && (
        <ResourceForm
          initialResource={editingResource}
          onClose={closeResourceForm}
          onSave={editingResource ? handleEditResource : handleAddResource}
          onDelete={editingResource ? handleDeleteResource : undefined}
        />
      )}
    </div>
  )
}