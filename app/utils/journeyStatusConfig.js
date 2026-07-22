// Journey-step status display. Parallels statusConfig.js (project statuses).
// Money steps don't use these directly — JourneyMap maps paid/unpaid onto
// its own pill before looking up here.

export const JOURNEY_STATUS_LABELS = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  waiting: 'Waiting',
  done: 'Done',
};

export const JOURNEY_STATUS_COLORS = {
  todo: 'text-white/40',
  'in-progress': 'text-teal',
  waiting: 'text-warning',
  done: 'text-white/50',
};

export const JOURNEY_STATUS_ORDER = ['todo', 'in-progress', 'waiting', 'done'];