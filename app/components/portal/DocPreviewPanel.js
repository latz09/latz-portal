'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { TbX, TbArrowsMaximize, TbArrowsMinimize } from 'react-icons/tb'

export default function DocPreviewPanel({
  doc, clientSlug, projectSlug, expanded, onExpandToggle, onClose,
}) {
  const open = !!doc
  const navigating = useRef(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  // Swipe-back / native back-gesture closes the panel instead of leaving
  // the project page — same pattern ClientSwitcher uses. Pushes a history
  // entry the moment the panel opens; a back-navigation (swipe or button)
  // pops it, which we intercept via popstate and treat as "close panel"
  // rather than letting the browser actually navigate away.
  useEffect(() => {
    if (!open) return
    window.history.pushState({ docPreviewOpen: true }, '')
    const onPopState = (e) => {
      if (e.state?.docPreviewOpen !== true) onClose()
    }
    window.addEventListener('popstate', onPopState)
    return () => {
      window.removeEventListener('popstate', onPopState)
      if (!navigating.current && window.history.state?.docPreviewOpen) {
        window.history.back()
      }
      navigating.current = false
    }
  }, [open, onClose])

  if (!open || typeof document === 'undefined') return null

  const src = `/clients/${clientSlug}/${projectSlug}/${doc.filename}`

  return createPortal(
    <div className='fixed inset-0 z-[110]'>
      <div
        className='absolute inset-0 bg-dark/50 backdrop-blur-[6px]'
        onClick={onClose}
      />
      <div
        className={`absolute inset-x-3 inset-y-6 bg-[#000000]/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl shadow-dark/60 flex flex-col transition-all duration-300 ${
          expanded
            ? 'lg:inset-0 lg:rounded-none'
            : 'lg:inset-y-4 2xl:inset-y-12 lg:left-1/2 lg:-translate-x-1/2 lg:right-auto lg:w-5/6 2xl:w-[67%] lg:rounded-2xl'
        }`}
      >
        <div className='flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-white/[0.08] shrink-0'>
          <span className='font-medium text-sm text-white truncate'>{doc.label}</span>
          <div className='flex items-center gap-1 shrink-0'>
            <button
              type='button'
              onClick={onExpandToggle}
              title={expanded ? 'Shrink panel' : 'Expand panel'}
              className='hidden lg:flex p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors'
            >
              {expanded ? <TbArrowsMinimize className='text-lg' /> : <TbArrowsMaximize className='text-lg' />}
            </button>
            <button
              type='button'
              onClick={onClose}
              title='Close preview'
              className='p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors'
            >
              <TbX className='text-lg' />
            </button>
          </div>
        </div>
        <iframe
          key={src}
          src={src}
          title={doc.label}
          className='flex-1 w-full bg-white rounded-b-2xl lg:rounded-none'
        />
      </div>
    </div>,
    document.body
  )
}