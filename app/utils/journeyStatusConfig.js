// Journey-step status display. Parallels statusConfig.js (project statuses).
// Money steps don't use these directly — JourneyRow maps paid/unpaid onto
// its own plain-text treatment before looking up here.

export const JOURNEY_STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  done: 'Done',
};

export const JOURNEY_STATUS_ORDER = ['todo', 'in-progress', 'waiting', 'done'];

// Muted states (todo, done) stay plain text — no pill — so attention
// naturally goes to steps that need it. Active states get real pills:
// in-progress follows the app-wide tinted-accent convention (teal fill +
// white/90 text); waiting follows the solid-fill convention warning/danger
// always use (solid bg + dark text) — it's the state most worth a second
// glance, since it means something's blocked outside your control.
const PILL_CONFIG = {
  todo: { text: 'text-white/40', pill: false },
  'in-progress': { text: 'text-white/90', pill: true, bg: 'bg-teal/15 border border-teal/30' },
  waiting: { text: 'text-dark', pill: true, bg: 'bg-warning' },
  done: { text: 'text-white/50', pill: false },
};

// className for a status label. Done rows always render extra-dim
// (text-white/30, no pill) to match the rest of a completed row's
// quieted styling, regardless of the stored status value.
export function statusPillClass(status, isDone) {
  if (isDone) return 'text-white/30';
  const cfg = PILL_CONFIG[status];
  if (!cfg) return 'text-white/40';
  return cfg.pill ? `${cfg.text} ${cfg.bg} px-2 py-0.5 rounded-full` : cfg.text;
}

// Kept for any other plain-text-only usages.
export const JOURNEY_STATUS_COLORS = {
  todo: 'text-white/40',
  'in-progress': 'text-teal',
  waiting: 'text-warning',
  done: 'text-white/50',
};