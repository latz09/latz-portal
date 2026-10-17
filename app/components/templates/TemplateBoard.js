'use client'

import { useState, useEffect } from 'react'
import { TbExternalLink, TbStarFilled, TbArrowRight, TbEye, TbX } from 'react-icons/tb'
import { accentForVariant } from '@/app/utils/variantColors'

function Legend() {
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8 font-mono text-[11px] text-white/50">
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-white/[0.04] border border-white/[0.08]" />
        Step
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-teal/[0.08] border-l-2 border-l-teal border-y border-r border-white/[0.08]" />
        Has generator <TbExternalLink size={12} className="text-teal" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-warning/[0.08] border-l-2 border-l-warning border-y border-r border-white/[0.08]" />
        Milestone <TbStarFilled size={12} className="text-warning" />
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-sm bg-warning/[0.08] border-l-2 border-l-warning border-y border-r border-white/[0.08]" />
        Milestone + generator <TbStarFilled size={12} className="text-warning" />
        <TbExternalLink size={12} className="text-teal" />
        <span className="text-white/30">(yellow border, both icons)</span>
      </div>
      <div className="flex items-center gap-2">
        <TbEye size={12} className="text-white/40" />
        Has example doc
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] text-white/25">designBrief.html</span>
        <span className="text-white/30">(no example yet — expected filename)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] tracking-widest uppercase text-danger">Deprecated</span>
        <span className="text-white/30">(dimmed row)</span>
      </div>
    </div>
  )
}

export default function TemplateBoard({ templateOptions, catalogs }) {
  const [activeKey, setActiveKey] = useState(templateOptions[0]?.key)
  const [openStep, setOpenStep] = useState(null)
  const [navHeight, setNavHeight] = useState(0)
  const catalog = catalogs[activeKey]
  const accent = accentForVariant('internal')
  const dimmed = Boolean(openStep)

  // Measures the real sticky nav instead of guessing its height, so the
  // panel/list never sit partially behind it regardless of nav content changes.
  useEffect(() => {
    const nav = document.querySelector('nav')
    if (!nav) return
    const update = () => setNavHeight(nav.getBoundingClientRect().height)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(nav)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setOpenStep(null)
  }, [activeKey])

  useEffect(() => {
    if (!openStep) return
    function onKey(e) {
      if (e.key === 'Escape') setOpenStep(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openStep])

  function toggleStep(step) {
    setOpenStep((current) => (current?._id === step._id ? null : step))
  }

  const chromeDimClass = dimmed
    ? 'opacity-30 hover:opacity-100 transition-opacity duration-150'
    : ''

  // Small buffer above the measured nav height so there's breathing room,
  // not a hairline gap that reads as misaligned.
  const stickyVars = { '--nav-h': `${navHeight + 16}px` }

  return (
    <div className="mb-24">
      <div className={chromeDimClass}>
        <div className="flex gap-2 mb-8">
          {templateOptions.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveKey(key)}
              className={
                key === activeKey
                  ? `${accent.fill.bg} ${accent.fill.text} border ${accent.fill.border} rounded-lg px-4 py-2 text-sm`
                  : 'bg-white/[0.04] border border-white/[0.08] text-white/60 hover:bg-white/[0.06] rounded-lg px-4 py-2 text-sm'
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {catalog?.brokenIds?.length > 0 && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white/80">
          {catalog.brokenIds.length} step id{catalog.brokenIds.length > 1 ? 's' : ''} in this
          template point at a generator that no longer exists: {catalog.brokenIds.join(', ')}
        </div>
      )}

      <div className={chromeDimClass}>
        <div className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-4">
          {catalog?.totalSteps} steps · {catalog?.deprecatedCount} deprecated
        </div>
        <Legend />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start" style={stickyVars}>
        <div
          className={`flex flex-col gap-y-10 w-full ${
            dimmed
              ? 'lg:w-[420px]  lg:shrink-0 lg:sticky lg:top-[var(--nav-h)] lg:h-[calc(100vh-var(--nav-h))] lg:overflow-y-auto lg:pr-2'
              : 'lg:max-w-3xl'
          }`}
        >
          {catalog?.phases.map((phase, phaseIndex) => (
            <div key={phase.phase}>
              <div
                className={`font-mono text-[11px] tracking-widest uppercase text-white/40 mb-2 flex items-center gap-2 transition-opacity duration-150 ${
                  dimmed ? 'opacity-30' : ''
                }`}
              >
                {phaseIndex > 0 && (
                  <TbArrowRight size={12} className="text-white/25 shrink-0 rotate-90" />
                )}
                {phase.label}
              </div>
              <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
                {phase.steps.map((step, i) => {
                  const isOpen = openStep?._id === step._id
                  const rowDimmed = dimmed && !isOpen

                  const borderAccent = isOpen
                    ? 'border-l-2 border-l-teal'
                    : step.isMilestone
                    ? 'border-l-2 border-l-warning'
                    : step.link
                    ? 'border-l-2 border-l-teal'
                    : 'border-l-2 border-l-transparent'

                  const bgAccent = isOpen
                    ? 'bg-teal/[0.12]'
                    : step.isMilestone
                    ? 'bg-warning/[0.08]'
                    : step.link
                    ? 'bg-teal/[0.08]'
                    : ''

                  // Dim takes priority over the deprecated treatment while a panel's
                  // open, so a deprecated row doesn't carry two competing opacities.
                  const opacityClass = isOpen
                    ? 'opacity-100'
                    : rowDimmed
                    ? 'opacity-50 hover:opacity-100 transition-opacity duration-150'
                    : step.deprecated
                    ? 'opacity-40'
                    : 'opacity-100'

                  return (
                    <div
                      key={step._id}
                      className={`px-4 py-3 ${borderAccent} ${bgAccent} ${opacityClass} ${
                        i < phase.steps.length - 1 ? 'border-b border-white/[0.06]' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm text-white/90 flex items-center gap-1.5">
                          {step.isMilestone && (
                            <TbStarFilled size={13} className="text-warning shrink-0" />
                          )}
                          {step.title}
                          {step.link && (
                            <a
                              href={step.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-teal hover:text-teal/70 shrink-0"
                            >
                              <TbExternalLink size={13} />
                            </a>
                          )}
                        </span>
                        <span className="flex items-center gap-3 shrink-0">
                          {step.assignedTo === 'designer' && (
                            <span className="font-mono text-[10px] tracking-widest uppercase text-purple">
                              Designer
                            </span>
                          )}
                          {step.exampleUrl ? (
                            <button
                              onClick={() => toggleStep(step)}
                              className={`flex items-center gap-1 font-mono text-[10px] tracking-widest uppercase ${
                                isOpen ? 'text-teal' : 'text-white/40 hover:text-teal'
                              }`}
                            >
                              <TbEye size={13} />
                              {isOpen ? 'Viewing' : 'Example'}
                            </button>
                          ) : (
                            step.exampleFilename && (
                              <span
                                className="font-mono text-[10px] text-white/25"
                                title="Drop a file with this name in /public/examples"
                              >
                                {step.exampleFilename}
                              </span>
                            )
                          )}
                        </span>
                      </div>
                      {step.deprecated && (
                        <div className="mt-1">
                          <span className="font-mono text-[10px] tracking-widest uppercase text-danger">
                            Deprecated
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {openStep && (
          <div className="w-full lg:flex-1 lg:sticky lg:top-[var(--nav-h)] h-[80vh]">
            <div className="h-full flex flex-col bg-white/[0.04] border border-teal/30 rounded-xl overflow-hidden animate-panel-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] shrink-0">
                <span className="text-sm text-white/90 truncate">{openStep.title}</span>
                <button
                  onClick={() => setOpenStep(null)}
                  className="text-white/40 hover:text-white/80 shrink-0"
                >
                  <TbX size={16} />
                </button>
              </div>
              <iframe
                src={openStep.exampleUrl}
                className="w-full flex-1 bg-white"
                title={`${openStep.title} example`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}