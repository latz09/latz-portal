/**
 * One place for every accent color combo used across the portal.
 * Right now the same teal/purple/white pairings are retyped slightly
 * differently in ProjectHeader, DeadlineList, DocumentList, ProjectLinks,
 * ClientList, and deadlineUtils. Import from here instead so changing a
 * color once (e.g. tweaking the designer purple) updates everywhere.
 */

// variant = who's looking at the page (internal / designer / client)
export const VARIANT_ACCENT = {
  internal: 'teal',
  designer: 'purple',
  client: 'teal',
}

// accent = the actual Tailwind class bundle for a given color name
export const ACCENTS = {
  teal: {
    text: 'text-teal',
    border: 'border-teal/30',
    hoverBg: 'hover:bg-teal/10',
    ring: 'border-teal/60 bg-teal/10',
  },
  purple: {
    text: 'text-purple',
    border: 'border-purple/30',
    hoverBg: 'hover:bg-purple/10',
    ring: 'border-purple/60 bg-purple/10',
  },
  warning: {
    text: 'text-warning',
    border: 'border-warning/30',
    hoverBg: 'hover:bg-warning/10',
    ring: 'border-warning/60 bg-warning/10',
  },
  danger: {
    text: 'text-danger',
    border: 'border-danger/30',
    hoverBg: 'hover:bg-danger/10',
    ring: 'border-danger/60 bg-danger/10',
  },
  white: {
    text: 'text-white/50',
    border: 'border-white/10',
    hoverBg: 'hover:bg-white/5',
    ring: 'border-white/20 bg-white/5',
  },
}

// convenience: get the accent bundle straight from a variant string
export function accentForVariant(variant) {
  return ACCENTS[VARIANT_ACCENT[variant] || 'teal']
}