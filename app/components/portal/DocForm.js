'use client'

import { useState } from 'react'
import { TbX, TbTrash } from 'react-icons/tb'

const CATEGORY_OPTIONS = [
  { value: 'overview', label: 'Overview' },
  { value: 'design', label: 'Design' },
  { value: 'handoff', label: 'Handoff' },
  { value: 'technical', label: 'Technical' },
  { value: 'other', label: 'Other' },
]

const AUDIENCE_OPTIONS = [
  { value: 'internal', label: 'Internal' },
  { value: 'designer', label: 'Designer' },
  { value: 'client', label: 'Client' },
]

const inputClass =
	'w-full bg-dark border border-white/[0.08] rounded-lg  px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:bg-[#000000]/85 focus:border-teal/80 transition-colors';

function toCamelFilename(label) {
  const camel = label
    .trim()
    .split(/\s+/)
    .map((word, i) => {
      const clean = word.replace(/[^a-zA-Z0-9]/g, '')
      if (!clean) return ''
      return i === 0
        ? clean.charAt(0).toLowerCase() + clean.slice(1)
        : clean.charAt(0).toUpperCase() + clean.slice(1)
    })
    .join('')
  return camel ? `${camel}.html` : ''
}

export default function DocForm({ onClose, onSave, onDelete, initialDoc = null }) {
  const isEdit = Boolean(initialDoc)

  const [label, setLabel] = useState(initialDoc?.label || '')
  const [filename, setFilename] = useState(initialDoc?.filename || '')
  const [category, setCategory] = useState(initialDoc?.category || 'overview')
  const [audience, setAudience] = useState(initialDoc?.audience || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const toggleAudience = (value) => {
    setAudience((a) => (a.includes(value) ? a.filter((v) => v !== value) : [...a, value]))
  }

  const handleGenerateFilename = () => {
    if (!label.trim()) return
    setFilename(toCamelFilename(label))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!label.trim() || !filename.trim()) {
      setError('Label and filename are required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const payload = { label: label.trim(), filename: filename.trim(), category, audience }
      if (isEdit) payload.key = initialDoc._key
      await onSave(payload)
    } catch (err) {
      setError(err.message || 'Failed to save')
      setSaving(false)
    }
  }

  const handleDeleteClick = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true)
      return
    }
    setDeleting(true)
    setError('')
    try {
      await onDelete(initialDoc._key)
    } catch (err) {
      setError(err.message || 'Failed to delete')
      setDeleting(false)
      setConfirmingDelete(false)
    }
  }

  return (
    <div
     className='fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-[6px]'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <form
        onSubmit={handleSubmit}
        className='w-full mx-4 sm:mx-2 sm:w-[32rem] bg-[#000000]/50 backdrop-blur-sm border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-dark/60 flex flex-col max-h-[85vh] overflow-y-auto'
      >
        <div className='flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0'>
          <p className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
            {isEdit ? 'Edit Document' : 'Add Document'}
          </p>
          <button type='button' onClick={onClose} className='text-white/30 hover:text-white transition-colors'>
            <TbX className='text-lg' />
          </button>
        </div>

        <div className='px-5 py-5 flex flex-col gap-4'>
          <div>
            <label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
              Label
            </label>
            <input
              autoFocus
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. Domain Access'
              className={inputClass}
            />
          </div>

          <div>
            <label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
              Filename
            </label>
            <div className='flex gap-2'>
              <input
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder='domainAccess.html'
                className={inputClass}
              />
              <button
                type='button'
                onClick={handleGenerateFilename}
                disabled={!label.trim()}
                className='shrink-0 px-3 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors disabled:opacity-30 disabled:hover:text-white/50 disabled:hover:border-white/[0.08]'
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
              Category
            </label>
            <div className='flex flex-wrap gap-1.5'>
              {CATEGORY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => setCategory(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
                    category === opt.value
                      ? 'bg-teal/80 border-teal/30 text-white/90'
                      : 'border-white/[0.08] bg-dark text-white/40 hover:text-dark hover:border-teal/40 hover:bg-teal/60 hover:scale-95'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
              Audience
            </label>
            <div className='flex flex-wrap gap-1.5'>
              {AUDIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => toggleAudience(opt.value)}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
                    audience.includes(opt.value)
                      ? 'bg-teal/80 border-teal/30 text-white/90'
                      : 'border-white/[0.08] bg-dark text-white/40 hover:text-dark hover:border-teal/40 hover:bg-teal/60 hover:scale-95'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className='text-[11px] text-danger'>{error}</p>}
        </div>

        {isEdit && (
          <div className='px-5 py-4 border-t border-white/10 shrink-0'>
            {!confirmingDelete ? (
              <button
                type='button'
                onClick={handleDeleteClick}
                className='flex items-center gap-1.5 text-xs text-danger/70 hover:text-danger transition-colors'
              >
                <TbTrash size={14} />
                Delete Document
              </button>
            ) : (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-white/50 flex-1'>Delete this document?</span>
                <button
                  type='button'
                  onClick={() => setConfirmingDelete(false)}
                  className='px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:text-white/80 transition-colors'
                >
                  Cancel
                </button>
                <button
                  type='button'
                  onClick={handleDeleteClick}
                  disabled={deleting}
                  className='px-3 py-1.5 rounded-lg bg-danger/15 border border-danger/40 text-xs text-danger hover:bg-danger/25 transition-colors disabled:opacity-50'
                >
                  {deleting ? 'Deleting…' : 'Confirm Delete'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className='flex gap-2 px-5 py-4 border-t border-white/10 shrink-0'>
          <button
            type='button'
            onClick={onClose}
            className='flex-1 py-2 rounded-lg border border-white/[0.08] text-sm text-white/50 hover:text-white/80 transition-colors'
          >
            Cancel
          </button>
          <button
            type='submit'
            disabled={saving}
            className='flex-1 py-2 rounded-lg bg-teal/15 border border-teal/30 text-sm text-white/90 hover:bg-teal/25 transition-colors disabled:opacity-50'
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Document'}
          </button>
        </div>
      </form>
    </div>
  )
}