'use client';

import { useState } from 'react';
import { TbChevronDown, TbCheck } from 'react-icons/tb';
import { PHASE_LABELS } from '@/app/utils/journeyHelpers';

function PhaseNode({ allDone, isCurrent }) {
  if (allDone) {
    return (
      <div className='w-7 h-7 rounded-full bg-teal flex items-center justify-center shrink-0 relative z-10'>
        <TbCheck className='text-black text-sm' />
      </div>
    );
  }
  if (isCurrent) {
    return (
      <div className='w-7 h-7 rounded-full border-2 border-teal bg-dark flex items-center justify-center shrink-0 relative z-10'>
        <div className='w-2 h-2 rounded-full bg-teal animate-pulse' />
      </div>
    );
  }
  return (
    <div className='w-7 h-7 rounded-full border-2 border-white/15 bg-dark flex items-center justify-center shrink-0 relative z-10'>
      <div className='w-1.5 h-1.5 rounded-full bg-white/20' />
    </div>
  );
}

export default function CollapsibleJourney({ phases }) {
  const [open, setOpen] = useState(() =>
    Object.fromEntries(phases.map((p) => [p.phase, p.defaultOpen]))
  );

  const allExpanded = phases.every((p) => open[p.phase]);
  const toggle = (phase) => setOpen((s) => ({ ...s, [phase]: !s[phase] }));
  const setAll = (val) => setOpen(Object.fromEntries(phases.map((p) => [p.phase, val])));

  return (
    <div>
      <div className='flex justify-end mb-4'>
        <button
          onClick={() => setAll(!allExpanded)}
          className='font-mono text-sm tracking-widest uppercase text-white/40 hover:text-teal transition-colors'
        >
          {allExpanded ? 'Collapse all' : 'Expand all'}
        </button>
      </div>

      <div className='relative'>
        {phases.map((p, i) => {
          const isOpen = open[p.phase];
          const isLast = i === phases.length - 1;
          const pct = p.total ? (p.doneCount / p.total) * 100 : 0;

          return (
            <div key={p.phase} className='relative grid grid-cols-[28px_1fr] gap-4'>
              {/* rail column: node + connector line */}
              <div className='relative flex flex-col items-center'>
                <PhaseNode allDone={p.allDone} isCurrent={p.isCurrent} />
                {!isLast && (
                  <div
                    className={`w-0.5 flex-1 -mt-1 ${
                      p.allDone ? 'bg-teal/40' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>

              {/* content column */}
             <div className={isLast ? 'pb-2' : 'pb-8'}>
                {/* phase header */}
                <button
                  onClick={() => toggle(p.phase)}
                  className='flex items-center gap-3 w-full group text-left pt-0.5'
                >
                  <span
                    className={`font-mono text-xs tracking-widest uppercase shrink-0 ${
                      p.isCurrent ? 'text-teal' : p.allDone ? 'text-white/40' : 'text-white/30'
                    }`}
                  >
                    {PHASE_LABELS[p.phase] || p.phase}
                  </span>

                  <span className='flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden min-w-8 max-w-48'>
                    <span
                      className='block h-full bg-teal/70 rounded-full'
                      style={{ width: `${pct}%` }}
                    />
                  </span>

                  <span className='font-mono text-xs text-white/30 tabular-nums shrink-0'>
                    {p.doneCount}/{p.total}
                  </span>
                  <TbChevronDown
                    className={`text-white/25 group-hover:text-white/60 transition-all shrink-0 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {/* workspace: steps for the open phase */}
                {isOpen && (
                  <div
                    className={`flex flex-col gap-2 mt-3 ${
                      p.isCurrent ? 'border-l-2 border-teal/30 pl-4 -ml-px' : 'pl-0'
                    }`}
                  >
                    {p.rows}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}