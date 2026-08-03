// Single source of truth for "where does clicking a client actually go" —
// used anywhere a client (not a specific project) can be selected: the
// client roster, the client switcher drawer, and global search. If there's
// exactly one active project, skip the picker page — there's no real
// choice to make. Two or more (or zero) active projects still goes to the
// client page, same as today.
export function getClientHref(client) {
	const active = (client.projects || []).filter((p) => p.status === 'active');
	if (active.length === 1) {
		return `/clients/${client.slug}/${active[0].slug}`;
	}
	return `/clients/${client.slug}`;
}