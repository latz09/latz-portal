// Single source of truth for project status display. The underlying stored
// value for "Leads" stays "potential" and "Lost" stays "on-ice" on purpose —
// renaming the strings would require migrating every existing document.
// Only the labels change.

export const STATUS_LABELS = {
	active: 'Active',
	'on-hold': 'On Hold',
	potential: 'Leads',
	'on-ice': 'Lost',
	complete: 'Complete',
}

export const STATUS_COLORS = {
	active: 'text-teal',
	'on-hold': 'text-warning',
	potential: 'text-white/40',
	'on-ice': 'text-danger/70',
	complete: 'text-white/50 italic line-through',
}

export const STATUS_ORDER = ['active', 'on-hold', 'potential', 'on-ice', 'complete']