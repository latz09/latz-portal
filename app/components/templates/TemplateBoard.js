'use client'

import { useState } from 'react'
import { TbExternalLink, TbStarFilled, TbArrowRight } from 'react-icons/tb'
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
        <span className="font-mono text-[10px] tracking-widest uppercase text-danger">Deprecated</span>
        <span className="text-white/30">(dimmed row)</span>
      </div>
    </div>
  )
}

export default function TemplateBoard({ templateOptions, catalogs }) {
  const [activeKey, setActiveKey] = useState(templateOptions[0]?.key)
  const catalog = catalogs[activeKey]
  const accent = accentForVariant('internal')

  return (
    <div className="mb-24">
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

      {catalog?.brokenIds?.length > 0 && (
        <div className="mb-6 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-white/80">
          {catalog.brokenIds.length} step id{catalog.brokenIds.length > 1 ? 's' : ''} in this
          template point at a generator that no longer exists: {catalog.brokenIds.join(', ')}
        </div>
      )}

      <div className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-4">
        {catalog?.totalSteps} steps · {catalog?.deprecatedCount} deprecated
      </div>

      <Legend />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-16 gap-y-24 items-center">
        {catalog?.phases.map((phase, phaseIndex) => (
          <div key={phase.phase}>
            <div className="font-mono text-[11px] tracking-widest uppercase text-white/40 mb-2 flex items-center gap-2">
              {phaseIndex > 0 && <TbArrowRight size={12} className="text-white/25 shrink-0" />}
              {phase.label}
            </div>
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden">
              {phase.steps.map((step, i) => {
                const borderAccent = step.isMilestone
                  ? 'border-l-2 border-l-warning'
                  : step.link
                  ? 'border-l-2 border-l-teal'
                  : 'border-l-2 border-l-transparent'

                const bgAccent = step.isMilestone
                  ? 'bg-warning/[0.08]'
                  : step.link
                  ? 'bg-teal/[0.08]'
                  : ''

                return (
                  <div
                    key={step._id}
                    className={`px-4 py-3 ${borderAccent} ${bgAccent} ${
                      i < phase.steps.length - 1 ? 'border-b border-white/[0.06]' : ''
                    } ${step.deprecated ? 'opacity-40' : ''}`}
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
                      {step.assignedTo === 'designer' && (
                        <span className="font-mono text-[10px] tracking-widest uppercase text-purple shrink-0">
                          Designer
                        </span>
                      )}
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
    </div>
  )
}