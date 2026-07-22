'use client';

import { useState } from 'react';
import JourneyRollupRow from './JourneyRollupRow';

const FILTERS = [
  { value: 'active', label: 'Active' },
  { value: 'on-hold', label: 'On Hold' },
  { value: 'potential', label: 'Leads' },
];

function ageMs(p) {
  const paid = p.clientPayment?.depositPaidDate;
  if (paid) return Date.now() - new Date(paid).getTime();
  if (p.month && p.year) return Date.now() - new Date(p.year, p.month - 1).getTime();
  return 0;
}

export default function JourneyRollup({ projects }) {
  // null = show all; otherwise the single selected status
  const [selected, setSelected] = useState(null);

  const visible = projects
    .filter((p) => selected === null || p.status === selected)
    .sort((a, b) => ageMs(b) - ageMs(a));

  return (
    <div>
      <div className='flex flex-wrap gap-2 mb-6'>
        <button
          onClick={() => setSelected(null)}
          className={`font-mono text-sm lg:text-base tracking-wide uppercase px-3 py-1.5 rounded-full border transition-colors ${
            selected === null
              ? 'bg-teal/15 border-teal/40 text-teal'
              : 'bg-transparent border-white/10 text-white/35 hover:text-white/60'
          }`}
        >
          All <span className='opacity-60'>{projects.length}</span>
        </button>
        {FILTERS.map((f) => {
          const active = selected === f.value;
          const count = projects.filter((p) => p.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setSelected(active ? null : f.value)}
              className={`font-mono text-sm lg:text-base tracking-wide uppercase px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? 'bg-teal/15 border-teal/40 text-teal'
                  : 'bg-transparent border-white/10 text-white/35 hover:text-white/60'
              }`}
            >
              {f.label} <span className='opacity-60'>{count}</span>
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className='font-mono text-sm text-white/40 py-8'>No projects match.</p>
      ) : (
        <div className='flex flex-col gap-2'>
          {visible.map((p) => (
            <JourneyRollupRow key={p._id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}