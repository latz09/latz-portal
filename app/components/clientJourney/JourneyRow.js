'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  TbCircleDot, TbFileText, TbCurrencyDollar, TbSparkles,
  TbLayout, TbPencil, TbBook, TbRocket, TbExternalLink, TbCheck, TbStarFilled,
  TbChevronDown,
} from 'react-icons/tb';
import {
  JOURNEY_STATUS_LABELS,
  JOURNEY_STATUS_ORDER,
  statusPillClass,
} from '@/app/utils/journeyStatusConfig';
import { resolveStep, dateLabel, stepTitle } from '@/app/utils/journeyHelpers';

const iconMap = {
  TbFileText, TbSparkles, TbLayout, TbPencil, TbBook, TbRocket, TbCurrencyDollar, TbCircleDot,
};

const WAITING_ON_OPTIONS = [
  { value: 'client', label: 'Client' },
  { value: 'designer', label: 'Designer' },
  { value: 'other', label: 'Other' },
];

function pickIcon({ money, hasLink, iconKey }) {
  if (iconKey && iconMap[iconKey]) return iconMap[iconKey];
  if (money) return TbCurrencyDollar;
  if (hasLink) return TbFileText;
  return TbCircleDot;
}

function localToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDue(dueDate) {
  return new Date(dueDate + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function JourneyRow({ step, index, clientPayment, projectId, isFirst, isLast }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [override, setOverride] = useState(null);
  const [dueDateOverride, setDueDateOverride] = useState(undefined);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingWaiting, setPendingWaiting] = useState(false);
  const [editingDate, setEditingDate] = useState(false);
  const [editingDueDate, setEditingDueDate] = useState(false);
  const [error, setError] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setPendingWaiting(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const resolved = resolveStep(step, clientPayment);
  const money = resolved.money;
  const displayStatus = override ? override.status : resolved.status;
  const displayWaitingOn = override ? override.waitingOn : step.waitingOn;
  const displayDate = override ? override.date : resolved.date;
  const displayDueDate = dueDateOverride !== undefined ? dueDateOverride : step.dueDate;

  const gens = step.generators || [];
  const title = stepTitle(step);
  const iconKey = gens[0]?.icon;
  const links = gens.filter((g) => g?.link);
  const deprecated = gens.some((g) => g?.deprecated);
  const derivedFrom = gens[0]?.derivedFrom;
  const dLabel = dateLabel(displayStatus, displayDate, money, displayWaitingOn);

  const isDone = displayStatus === 'done';
  const isMilestone = gens.some((g) => g?.isMilestone);
  const Icon = isDone ? TbCheck : pickIcon({ money, hasLink: links.length > 0, iconKey });

  const pillLabel = money
    ? isDone ? '✓ Paid' : 'Unpaid'
    : JOURNEY_STATUS_LABELS[displayStatus] || displayStatus;

  async function save(nextStatus, nextWaitingOn, dateOverrideValue) {
    const prev = override;
    const optimisticDate =
      dateOverrideValue ||
      (nextStatus === 'waiting' || nextStatus === 'done' ? localToday() : null);

    setOverride({ status: nextStatus, waitingOn: nextWaitingOn, date: optimisticDate });
    setMenuOpen(false);
    setPendingWaiting(false);
    setEditingDate(false);
    setError(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stepKey: step._key,
          status: nextStatus,
          waitingOn: nextWaitingOn,
          derivedFrom,
          dateOverride: dateOverrideValue || undefined,
        }),
      });
      if (!res.ok) throw new Error('save failed');
      startTransition(() => router.refresh());
    } catch (e) {
      setOverride(prev);
      setError(true);
    }
  }

  async function saveDueDate(newDueDate) {
    const prev = dueDateOverride;
    setDueDateOverride(newDueDate || null);
    setEditingDueDate(false);
    setError(false);

    try {
      const res = await fetch(`/api/projects/${projectId}/journey`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepKey: step._key, dueDate: newDueDate || null }),
      });
      if (!res.ok) throw new Error('save failed');
      startTransition(() => router.refresh());
    } catch (e) {
      setDueDateOverride(prev);
      setError(true);
    }
  }

  function handleStatusPick(newStatus) {
    if (newStatus === 'waiting') {
      setPendingWaiting(true);
      return;
    }
    save(newStatus, null);
  }

  function handleMoneyToggle() {
    save(isDone ? 'todo' : 'done', null);
  }

  const showWaitingSubmenu = menuOpen && (displayStatus === 'waiting' || pendingWaiting);
  const canEditDate = displayStatus === 'waiting' || displayStatus === 'done';

  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 lg:gap-4 px-3 lg:px-4 transition-colors hover:bg-white/[0.03] ${
        isDone ? 'py-2' : 'py-2.5 lg:py-3'
      } ${!isLast ? 'border-b border-white/[0.06]' : ''} ${isFirst ? 'rounded-t-xl' : ''} ${
        isLast ? 'rounded-b-xl' : ''
      } ${error ? 'bg-danger/5' : ''}`}
    >
      {/* content: index, star, icon, title + nested date/link lines — full width on mobile */}
      <div className='flex items-center gap-2.5 lg:gap-3 min-w-0'>
        <span className={`font-mono text-[11px] lg:text-xs tabular-nums shrink-0 ${isDone ? 'text-white/15' : 'text-white/25'}`}>
          {String(index + 1).padStart(2, '0')}
        </span>
        {isMilestone && (
          <TbStarFilled
            className={`shrink-0 ${isDone ? 'text-warning/30 text-xs' : 'text-warning text-sm'}`}
          />
        )}
        <Icon className={`shrink-0 ${isDone ? 'text-teal/40 text-xs lg:text-sm' : 'text-teal text-base lg:text-lg'}`} />
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

          {/* mobile-only: links grouped with the item they belong to, not off in the actions row */}
          {!isDone && links.length > 0 && (
            <div className='flex items-center gap-3 mt-1 lg:hidden'>
              {links.map((g) => (
                <a
                  key={g._id}
                  href={g.link}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-1 font-mono text-[11px] text-white/50 hover:text-teal transition-colors'
                >
                  Open <TbExternalLink />
                </a>
              ))}
            </div>
          )}

          {isMilestone && !isDone && (
            editingDueDate ? (
              <input
                type='date'
                autoFocus
                defaultValue={displayDueDate || ''}
                onBlur={(e) => saveDueDate(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                  if (e.key === 'Escape') setEditingDueDate(false);
                }}
                className='mt-1 w-fit bg-dark border border-white/20 rounded px-1.5 py-0.5 font-mono text-[11px] text-white/80'
              />
            ) : (
              <span className='flex items-center gap-1 font-mono text-[11px] lg:text-[12px] mt-1'>
                <span className={displayDueDate ? 'text-warning/60' : 'text-warning/40'}>
                  {displayDueDate ? `Due ${formatDue(displayDueDate)}` : 'Milestone — no date set'}
                </span>
                <button
                  type='button'
                  onClick={() => setEditingDueDate(true)}
                  className='text-white/20 hover:text-white/50 transition-colors'
                >
                  <TbPencil className='text-[11px]' />
                </button>
              </span>
            )
          )}

          {dLabel && (
            editingDate ? (
              <input
                type='date'
                autoFocus
                defaultValue={displayDate || localToday()}
                onBlur={(e) => e.target.value && save(displayStatus, displayWaitingOn, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.target.blur();
                  if (e.key === 'Escape') setEditingDate(false);
                }}
                className='mt-1 w-fit bg-dark border border-white/20 rounded px-1.5 py-0.5 font-mono text-[11px] text-white/80'
              />
            ) : (
              <span className={`flex items-center gap-1 font-mono text-[11px] lg:text-[12px] mt-1 ${isDone ? 'text-white/25' : 'text-warning'}`}>
                {dLabel}
                {canEditDate && (
                  <button
                    type='button'
                    onClick={() => setEditingDate(true)}
                    className='text-white/20 hover:text-white/50 transition-colors'
                  >
                    <TbPencil className='text-[11px]' />
                  </button>
                )}
              </span>
            )
          )}
        </div>
      </div>

      {/* actions: status/money control only on mobile — links moved above; desktop keeps the original single-row layout */}
      <div className='flex items-center justify-end gap-3 shrink-0 relative'>
        {!isDone && links.length > 0 && (
          <div className='hidden lg:flex items-center gap-3'>
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
          </div>
        )}

        {money ? (
          <button
            type='button'
            onClick={handleMoneyToggle}
            disabled={isPending}
            className='flex items-center gap-1.5 font-mono text-[11px] lg:text-xs uppercase tracking-wide disabled:opacity-50'
          >
            <span className='font-mono text-[10px] text-white/25 uppercase'>auto</span>
            <span className={isDone ? 'text-teal/70' : 'text-white/40'}>{pillLabel}</span>
          </button>
        ) : (
          <div className='relative' ref={menuRef}>
            <button
              type='button'
              onClick={() => setMenuOpen((v) => !v)}
              disabled={isPending}
              className='flex items-center gap-1.5 disabled:opacity-50'
            >
              <span className={`font-mono text-[11px] lg:text-xs uppercase tracking-wide ${statusPillClass(displayStatus, isDone)}`}>
                {pillLabel}
              </span>
              <TbChevronDown className='text-white/30 text-[10px]' />
            </button>

            {menuOpen && (
              <div className='absolute right-0 top-full mt-1 z-20 bg-dark border border-white/10 rounded-lg py-1 min-w-28 lg:min-w-32 shadow-xl'>
                {JOURNEY_STATUS_ORDER.map((s) => (
                  <button
                    key={s}
                    type='button'
                    onClick={() => handleStatusPick(s)}
                    className={`block w-full text-left px-3 py-1.5 font-mono text-[11px] lg:text-xs uppercase tracking-wide hover:bg-white/5 ${
                      s === displayStatus ? 'text-teal' : 'text-white/60'
                    }`}
                  >
                    {JOURNEY_STATUS_LABELS[s]}
                  </button>
                ))}

                {showWaitingSubmenu && (
                  <div className='border-t border-white/10 mt-1 pt-1'>
                    {WAITING_ON_OPTIONS.map((w) => (
                      <button
                        key={w.value}
                        type='button'
                        onClick={() => save('waiting', w.value)}
                        className={`block w-full text-left px-3 py-1.5 font-mono text-[11px] lg:text-xs hover:bg-white/5 ${
                          w.value === displayWaitingOn ? 'text-teal' : 'text-white/50'
                        }`}
                      >
                        on {w.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}