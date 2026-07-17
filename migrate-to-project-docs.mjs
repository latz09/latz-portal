/**
 * Migrates embedded `projects[]` (inline objects on `client` documents)
 * into standalone top-level `project` documents that reference their client.
 *
 * SETUP
 *   npm install @sanity/client
 *
 * ENV VARS (put these in a local .env you don't commit, or export in shell)
 *   SANITY_PROJECT_ID     your Sanity project ID
 *   SANITY_DATASET        e.g. "production"
 *   SANITY_WRITE_TOKEN    a token with Editor/Write access (Studio > API > Tokens)
 *
 * USAGE
 *   node migrate-to-project-docs.mjs --dry-run     # preview only, writes nothing
 *   node migrate-to-project-docs.mjs               # actually creates project docs
 *
 *   # ONLY after you've eyeballed every migrated project in Studio and confirmed
 *   # it looks right, run this to strip the old embedded field off clients:
 *   node migrate-to-project-docs.mjs --unset-old
 *
 * NOTES
 *   - Uses a deterministic _id (`project-<clientSlug>-<projectSlug>`), so re-running
 *     with the same data is safe (createOrReplace, not create).
 *   - Deploy the new project.js / client.js schemas to Studio BEFORE running this,
 *     so the `project` document type exists.
 *   - The old `projects` field on client is left alone until you explicitly run
 *     --unset-old, so nothing is destructive until you say so.
 */

import { createClient } from '@sanity/client';

const client = createClient({
	projectId: process.env.SANITY_PROJECT_ID,
	dataset: process.env.SANITY_DATASET || 'production',
	apiVersion: '2024-01-01',
	token: process.env.SANITY_WRITE_TOKEN,
	useCdn: false,
});

const DRY_RUN = process.argv.includes('--dry-run');
const UNSET_OLD = process.argv.includes('--unset-old');

function stripUndefined(obj) {
	Object.keys(obj).forEach((k) => obj[k] === undefined && delete obj[k]);
	return obj;
}

async function migrate() {
	const clients = await client.fetch(
		`*[_type == "client" && !(_id in path("drafts.**")) && defined(projects)]{ _id, name, "slug": slug.current, projects }`,
	);

	console.log(
		`Found ${clients.length} client document(s) with embedded projects.\n`,
	);

	const tx = client.transaction();
	let projectCount = 0;
	let skipped = 0;

	for (const c of clients) {
		if (!c.slug) {
			console.warn(`  Skipping client "${c.name}" — no slug set.`);
			continue;
		}
		for (const p of c.projects || []) {
			const projectSlug = typeof p.slug === 'string' ? p.slug : p.slug?.current;
			if (!projectSlug) {
				console.warn(
					`  Skipping a project on "${c.name}" — missing slug (name: ${p.name || 'untitled'}).`,
				);
				skipped++;
				continue;
			}

			const docId = `project-${c.slug}-${projectSlug}`;

			const doc = stripUndefined({
				_id: docId,
				_type: 'project',
				client: { _type: 'reference', _ref: c._id },
				name: p.name,
				slug: { _type: 'slug', current: projectSlug },
				status: p.status,
				month: p.month,
				year: p.year,
				aiProjectLink: p.aiProjectLink,
				previewUrl: p.previewUrl,
				figmaUrl: p.figmaUrl,
				studioUrl: p.studioUrl,
				vercelUrl: p.vercelUrl,
				docs: p.docs || [],
				deadlines: p.deadlines || [],
				resources: p.resources || [],
				inspiration: p.inspiration || [],
			});

			console.log(`  -> ${docId}   (${c.name} / ${p.name || projectSlug})`);
			projectCount++;

			if (!DRY_RUN) {
				tx.createOrReplace(doc);
			}
		}
	}

	console.log(
		`\n${projectCount} project document(s) ${DRY_RUN ? 'would be created' : 'queued'}.`,
	);
	if (skipped)
		console.log(
			`${skipped} project(s) skipped — missing slug, fix in Studio and re-run.`,
		);

	if (DRY_RUN) {
		console.log(
			'\nDry run only — nothing written. Re-run without --dry-run to commit.',
		);
		return;
	}

	await tx.commit();
	console.log('\nDone. Projects migrated as standalone documents.');
	console.log(
		'Go check them in Studio (they\'ll show up under the new "Project" type).',
	);
	console.log(
		"Once you've confirmed everything looks right, run with --unset-old to",
	);
	console.log(
		'remove the old embedded "projects" field from client documents.',
	);
}

async function unsetOld() {
	const clients = await client.fetch(
		`*[_type == "client" && defined(projects)]{ _id, name }`,
	);
	console.log(
		`Removing embedded "projects" field from ${clients.length} client document(s)...`,
	);

	const tx = client.transaction();
	for (const c of clients) {
		tx.patch(c._id, (patch) => patch.unset(['projects']));
	}
	await tx.commit();

	console.log('Done. Client documents are now clean (name + slug only).');
}

const run = UNSET_OLD ? unsetOld : migrate;

run().catch((err) => {
	console.error('\nMigration failed:', err.message);
	process.exit(1);
});
