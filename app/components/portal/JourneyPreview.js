import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_COLORS,
} from '@/app/utils/journeyStatusConfig';
import {
  PHASE_LABELS,
  summarizeJourney,
  dateLabel,
  stepTitle,
} from '@/app/utils/journeyHelpers';

export default function JourneyPreview({ journeySteps, clientPayment, clientSlug, projectSlug }) {
  const summary = summarizeJourney(journeySteps, clientPayment);
  if (!summary) return null;

  const { doneCount, total, currentPhase, active, nextUp, allDone } = summary;
  const href = `/clients/${clientSlug}/${projectSlug}/journey`;

  return (
    <div className='my-10 '>
      <div className='flex items-center justify-between gap-3 mb-4'>
        <p className='font-mono text-xs lg:text-base text-white/60 tracking-widest uppercase'>
          Journey Map
        </p>
        <Link
          href={href}
          className='flex items-center gap-1 font-mono text-xs text-teal hover:text-white transition-colors'
        >
          View full journey <TbArrowRight />
        </Link>
      </div>

      <Link
        href={href}
        className='block bg-white/5 hover:bg-white/10 border border-white/10 rounded p-5 transition-colors'
      >
        {/* top row: current phase + progress */}
        <div className='flex items-center justify-between gap-4 mb-4'>
          <div className='flex flex-col gap-1 min-w-0'>
            <span className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
              {allDone ? 'Complete' : 'Current Phase'}
            </span>
            <span className='font-medium text-base leading-tight truncate'>
              {allDone ? 'All steps done' : (PHASE_LABELS[currentPhase] || currentPhase || '—')}
            </span>
          </div>
          <div className='flex flex-col items-end shrink-0'>
            <span className='font-mono text-sm text-white/80 tabular-nums'>
              {doneCount}<span className='text-white/30'>/{total}</span>
            </span>
            <span className='font-mono text-[10px] tracking-widest uppercase text-white/30'>done</span>
          </div>
        </div>

        {/* progress bar */}
        <div className='h-1 rounded-full bg-white/10 overflow-hidden mb-4'>
          <div
            className='h-full bg-teal rounded-full'
            style={{ width: `${total ? (doneCount / total) * 100 : 0}%` }}
          />
        </div>

        {/* active steps */}
        {active.length > 0 && (
          <div className='flex flex-col gap-2 mb-3'>
            {active.map(({ step, status, date, money }) => {
              const dLabel = dateLabel(status, date, money);
              const pillColor = JOURNEY_STATUS_COLORS[status] || 'text-white/40';
              return (
                <div key={step._key} className='flex items-center justify-between gap-3'>
                  <span className='text-sm text-white/80 truncate'>{stepTitle(step)}</span>
                  <span className='flex flex-col items-end shrink-0'>
                    <span className={`font-mono text-xs uppercase tracking-wide ${pillColor}`}>
                      {JOURNEY_STATUS_LABELS[status] || status}
                    </span>
                    {dLabel && (
                      <span className='font-mono text-[10px] text-white/30'>{dLabel}</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* next up */}
        {!allDone && nextUp && (
          <div className='flex items-center gap-2 pt-3 border-t border-white/10'>
            <span className='font-mono text-[10px] tracking-widest uppercase text-white/30 shrink-0'>
              Next
            </span>
            <span className='text-sm text-white/60 truncate'>{stepTitle(nextUp.step)}</span>
          </div>
        )}
      </Link>
    </div>
  );
}