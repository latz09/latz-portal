// Designer-payment status → display text + accent color, for any surface
// showing Alyssa's payment status as a short label (portal, tables, ledger
// rows). One place to tweak wording/color instead of hunting every render site.

const OVERRIDES = {
	'waiting-on-payment': {
		text: 'Waiting on client payment to get started',
		className: 'text-warning',
	},
}

export function designerStatusLabel(status) {
	return OVERRIDES[status]?.text || (status || 'not-started').replace('-', ' ')
}

// Returns null when there's no override, so callers fall back to their own default color class.
export function designerStatusClassName(status) {
	return OVERRIDES[status]?.className || null
}