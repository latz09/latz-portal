import {
  TbCircleDot,
  TbFileText,
  TbCurrencyDollar,
  TbSparkles,
  TbLayout,
  TbPencil,
  TbBook,
  TbRocket,
  TbExternalLink,
} from 'react-icons/tb';
import { formatDate, getDeadlineStatus } from './deadlineUtils';
import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_COLORS,
} from '@/app/utils/journeyStatusConfig';

// Optional icon-key map — honors the catalog `icon` string field when set
// (e.g. icon: 'TbFileText'). Same pattern as DocumentList's docIcon map.
const iconMap = {
  TbFileText,
  TbSparkles,
  TbLayout,
  TbPencil,
  TbBook,
  TbRocket,
  TbCurrencyDollar,
  TbCircleDot,
};

// Money steps ignore their stored status and read clientPayment instead.
// Everything else uses its own status + the matching hidden date field.
function resolveStep(step, clientPayment) {
  const derived = step.generators?.[0]?.derivedFrom;

  if (derived === 'deposit') {
    const paid = !!clientPayment?.depositPaid;
    return {
      status: paid ? 'done' : 'todo',
      date: paid ? clientPayment?.depositPaidDate : null,
      money: true,
    };
  }
  if (derived === 'final') {
    const paid = !!clientPayment?.finalPaid;
    return {
      status: paid ? 'done' : 'todo',
      date: paid ? clientPayment?.finalPaidDate : null,
      money: true,
    };
  }

  const status = step.status || 'todo';
  const date =
    status === 'waiting'
      ? step.enteredWaitingAt
      : status === 'done'
        ? step.completedAt
        : null;
  return { status, date, money: false };
}

function pickIcon({ money, hasLink, iconKey }) {
  if (iconKey && iconMap[iconKey]) return iconMap[iconKey];
  if (money) return TbCurrencyDollar;
  if (hasLink) return TbFileText;
  return TbCircleDot;
}

function dateLabel(status, date, money) {
  if (!date) return null;
  const formatted = formatDate(getDeadlineStatus(date).date);
  if (status === 'waiting') return `Waiting since ${formatted}`;
  if (status === 'done') return `${money ? 'Paid' : 'Done'} ${formatted}`;
  return null;
}

export default function JourneyMap({ journeySteps, clientPayment }) {
  if (!journeySteps?.length) return null;

//   console.log(journeySteps)

  return (
    <div className='mt-10'>
      <div className='flex items-center gap-3 mb-4'>
        <p className='font-mono text-xs lg:text-base text-white/60 tracking-widest uppercase'>
          Journey Map
        </p>
        <span className='font-mono text-xs bg-black text-white/60 border border-white/10 rounded-full px-2 py-0.5'>
          {journeySteps.length}
        </span>
      </div>

      <div className='flex flex-col gap-2'>
        {journeySteps.map((step, i) => {
          const { status, date, money } = resolveStep(step, clientPayment);
          const gens = step.generators || [];
          const title =
            gens
              .map((g) => g?.title)
              .filter(Boolean)
              .join(' + ') || 'Journey step';
          const iconKey = gens[0]?.icon;
          const links = gens.filter((g) => g?.link);
          const deprecated = gens.some((g) => g?.deprecated);
          const Icon = pickIcon({ money, hasLink: links.length > 0, iconKey });
          const dLabel = dateLabel(status, date, money);

          const pillLabel = money
            ? status === 'done'
              ? '✓ Paid'
              : 'Unpaid'
            : JOURNEY_STATUS_LABELS[status] || status;
          const pillColor = money
            ? status === 'done'
              ? 'text-teal'
              : 'text-white/40'
            : JOURNEY_STATUS_COLORS[status] || 'text-white/40';

          return (
            <div
              key={step._key}
              className='flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded px-4 py-3'
            >
              <div className='flex items-center gap-3 min-w-0'>
                <span className='font-mono text-xs text-white/25 tabular-nums shrink-0'>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Icon className='text-lg text-teal shrink-0' />
                <div className='flex flex-col min-w-0'>
                  <span className='font-medium text-sm leading-tight truncate'>
                    {title}
                    {deprecated && (
                      <span className='font-mono text-[10px] text-danger/70 ml-2 uppercase'>
                        deprecated
                      </span>
                    )}
                  </span>
                  {dLabel && (
                    <span className='font-mono text-[11px] text-white/30 mt-0.5'>
                      {dLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className='flex items-center gap-3 shrink-0'>
                {links.map((g) => (
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
                  {money && (
                    <span className='font-mono text-[10px] text-white/25 uppercase'>
                      auto
                    </span>
                  )}
                  <span
                    className={`font-mono text-xs uppercase tracking-wide ${pillColor}`}
                  >
                    {pillLabel}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}