// Single source of truth for project status display. The underlying stored
// value for "Leads" stays "potential" on purpose — renaming the string itself
// would require migrating every existing lead document. Only the label changes.

export const STATUS_LABELS = {
	active: 'Active',
	'on-hold': 'On Hold',
	potential: 'Leads',
	'on-ice': 'On Ice',
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