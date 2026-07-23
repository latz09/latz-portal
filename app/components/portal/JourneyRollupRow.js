import Link from 'next/link';
import { TbArrowRight } from 'react-icons/tb';
import { PHASE_LABELS, summarizeJourney, stepTitle } from '@/app/utils/journeyHelpers';

const STATUS_TINT = {
  active: 'text-teal',
  'on-hold': 'text-warning',
  potential: 'text-white/40',
};

function ageLabel(project) {
  const paid = project.clientPayment?.depositPaidDate;
  if (paid) {
    const start = new Date(paid);
    const weeks = Math.floor((Date.now() - start.getTime()) / (1000 * 60 * 60 * 24 * 7));
    if (weeks <= 0) return 'landed this week';
    return `${weeks} wk${weeks === 1 ? '' : 's'} in`;
  }
  if (project.month && project.year) {
    const d = new Date(project.year, project.month - 1);
    return `since ${d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
  }
  return null;
}

export default function JourneyRollupRow({ project }) {
  const summary = summarizeJourney(project.journeySteps, project.clientPayment);
  if (!summary) return null;

  const { doneCount, total, currentPhase, nextUp, allDone } = summary;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;
  const href = `/clients/${project.clientSlug}/${project.slug}/journey`;
  const age = ageLabel(project);

  return (
    <Link
      href={href}
      className='block bg-white/5 hover:bg-white/10 border border-white/10 rounded px-4 lg:px-6 py-4 transition-colors group'
    >
      {/* desktop: 3 aligned columns · mobile: stacked */}
      <div className='flex flex-col gap-3 lg:grid lg:grid-cols-[280px_1fr_140px] lg:items-center lg:gap-8'>

        {/* name + status */}
        <div className='flex items-start justify-between gap-3 min-w-0'>
          <div className='flex flex-col min-w-0'>
            <span className='font-medium text-sm lg:text-base leading-tight truncate'>
              {project.clientName}
            </span>
            <span className='font-mono text-xs text-white/40 truncate mt-0.5'>
              {project.name}
            </span>
          </div>
          {/* age shows here on mobile (top-right of the card) */}
          {age && (
            <span className={`lg:hidden font-mono text-[11px] shrink-0 ${STATUS_TINT[project.status] || 'text-white/40'}`}>
              {age}
            </span>
          )}
        </div>

        {/* progress + phase/next — now visible on all sizes */}
        <div className='flex flex-col gap-2 min-w-0'>
          <div className='flex items-center gap-3'>
         <span className='flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden'>
              <span className='block h-full bg-teal rounded-full' style={{ width: `${pct}%` }} />
            </span>
            <span className='font-mono text-xs text-white/60 tabular-nums shrink-0'>
              {doneCount}/{total}
            </span>
          </div>
          <div className='flex items-center gap-2 font-mono text-[11px] min-w-0'>
            <span className={`uppercase tracking-wide shrink-0 ${allDone ? 'text-teal' : 'text-white/50'}`}>
              {allDone ? 'Complete' : (PHASE_LABELS[currentPhase] || currentPhase || '—')}
            </span>
            {!allDone && nextUp && (
              <span className='text-white/30 truncate'>→ {stepTitle(nextUp.step)}</span>
            )}
          </div>
        </div>

        {/* age (desktop) + arrow */}
        <div className='flex items-center justify-between lg:justify-end gap-4 shrink-0'>
          {age && (
            <span className={`hidden lg:block font-mono text-[11px] ${STATUS_TINT[project.status] || 'text-white/40'}`}>
              {age}
            </span>
          )}
          <TbArrowRight className='text-white/25 group-hover:text-teal transition-colors ml-auto lg:ml-0' />
        </div>
      </div>
    </Link>
  );
}