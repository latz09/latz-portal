import {
  TbCircleDot, TbFileText, TbCurrencyDollar, TbSparkles,
  TbLayout, TbPencil, TbBook, TbRocket, TbExternalLink, TbCheck,
} from 'react-icons/tb';
import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_COLORS,
} from '@/app/utils/journeyStatusConfig';
import { resolveStep, dateLabel, stepTitle } from '@/app/utils/journeyHelpers';

const iconMap = {
  TbFileText, TbSparkles, TbLayout, TbPencil, TbBook, TbRocket, TbCurrencyDollar, TbCircleDot,
};

function pickIcon({ money, hasLink, iconKey }) {
  if (iconKey && iconMap[iconKey]) return iconMap[iconKey];
  if (money) return TbCurrencyDollar;
  if (hasLink) return TbFileText;
  return TbCircleDot;
}

export default function JourneyRow({ step, index, clientPayment }) {
  const { status, date, money } = resolveStep(step, clientPayment);
  const gens = step.generators || [];
  const title = stepTitle(step);
  const iconKey = gens[0]?.icon;
  const links = gens.filter((g) => g?.link);
  const deprecated = gens.some((g) => g?.deprecated);
  const dLabel = dateLabel(status, date, money);

  const isDone = status === 'done';
  const Icon = isDone ? TbCheck : pickIcon({ money, hasLink: links.length > 0, iconKey });

  const pillLabel = money
    ? status === 'done' ? '✓ Paid' : 'Unpaid'
    : JOURNEY_STATUS_LABELS[status] || status;
  const pillColor = money
    ? status === 'done' ? 'text-teal' : 'text-white/40'
    : JOURNEY_STATUS_COLORS[status] || 'text-white/40';

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded px-4 border transition-colors ${
        isDone
          ? 'bg-transparent border-white/[0.04] py-2'
          : 'bg-white/5 border-white/10 py-3'
      }`}
    >
      <div className='flex items-center gap-3 min-w-0'>
        <span className={`font-mono text-xs tabular-nums shrink-0 ${isDone ? 'text-white/15' : 'text-white/25'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <Icon className={`shrink-0 ${isDone ? 'text-teal/40 text-sm' : 'text-teal text-lg'}`} />
        <div className='flex flex-col min-w-0'>
          <span
            className={`leading-tight truncate ${
              isDone ? 'text-sm font-normal text-white/40' : 'text-sm font-medium text-white'
            }`}
          >
            {title}
            {deprecated && (
              <span className='font-mono text-[10px] text-danger/70 ml-2 uppercase'>deprecated</span>
            )}
          </span>
          {dLabel && !isDone && (
            <span className='font-mono text-[11px] text-white/30 mt-0.5'>{dLabel}</span>
          )}
        </div>
      </div>

      <div className='flex items-center gap-3 shrink-0'>
        {!isDone && links.map((g) => (
          <a
            key={g._id}
            href={g.link}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center gap-1 font-mono text-xs text-white/50 hover:text-teal transition-colors'
          >
            Open <TbExternalLink />
          </a>
        ))}
        <span className='flex items-center gap-1.5'>
          {money && !isDone && <span className='font-mono text-[10px] text-white/25 uppercase'>auto</span>}
          <span className={`font-mono text-xs uppercase tracking-wide ${isDone ? 'text-white/30' : pillColor}`}>
            {pillLabel}
          </span>
        </span>
      </div>
    </div>
  );
}