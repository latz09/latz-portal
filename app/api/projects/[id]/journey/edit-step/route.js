import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import { PHASE_ORDER, findInsertionIndex } from '@/app/utils/journeyHelpers'

const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/

// Launch / Domain Connect's catalog _id — same step ProjectMilestones.js
// guards. Deleting it would break the post-launch-milestones toggle.
const LAUNCH_ID = '145aec94-3211-49cf-80e8-06f884d7cc18'

export async function POST(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id: projectId } = await params
	const { stepKey, titleOverride, phaseOverride } = await request.json()

	if (!stepKey || !KEY_PATTERN.test(stepKey)) {
		return NextResponse.json({ error: 'Invalid stepKey' }, { status: 400 })
	}
	if (phaseOverride && !PHASE_ORDER.includes(phaseOverride)) {
		return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
	}

	try {
		const project = await writeClient.fetch(
			`*[_type == "project" && _id == $projectId][0]{
				"steps": journeySteps[] {
					...,
					"generatorPhase": generators[0]->phase
				}
			}`,
			{ projectId }
		)
		if (!project) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		const steps = project.steps || []
		const current = steps.find((s) => s._key === stepKey)
		if (!current) {
			return NextResponse.json({ error: 'Step not found' }, { status: 404 })
		}

		const oldPhase = current.phaseOverride || current.generatorPhase
		// Clearing the override (phaseOverride omitted) falls back to the
		// generator's own phase, same as display logic does.
		const newPhase = phaseOverride || current.generatorPhase
		const phaseChanged = newPhase !== oldPhase

		const titlePath = `journeySteps[_key=="${stepKey}"].titleOverride`
		const phasePath = `journeySteps[_key=="${stepKey}"].phaseOverride`

		if (!phaseChanged) {
			// No array move needed — plain array-key field update.
			let patch = writeClient.patch(projectId)
			const unsetPaths = []

			if (titleOverride?.trim()) {
				patch = patch.set({ [titlePath]: titleOverride.trim() })
			} else {
				unsetPaths.push(titlePath)
			}

			if (phaseOverride) {
				patch = patch.set({ [phasePath]: phaseOverride })
			} else {
				unsetPaths.push(phasePath)
			}

			if (unsetPaths.length) patch = patch.unset(unsetPaths)
			await patch.commit()
			return NextResponse.json({ success: true, moved: false })
		}

		// Phase changed — the step has to physically move in the array, since
		// CollapsibleJourney's phase grouping walks array position, not just
		// the field (see findInsertionIndex's doc comment in journeyHelpers.js).
		// Sanity can't anchor an insert to a slot that's being removed in the
		// same patch, so this is two sequential commits: remove, then insert
		// at a freshly-computed index. Non-atomic — a crash between the two
		// would leave the step deleted without being reinserted. Low risk for
		// single-editor use, but worth knowing; say if you'd rather I add a
		// recovery append on the second commit failing.
		const remaining = steps
			.filter((s) => s._key !== stepKey)
			.map((s) => ({ _key: s._key, phase: s.phaseOverride || s.generatorPhase }))

		const insertionIndex = findInsertionIndex(remaining, newPhase)

		const updatedStep = { ...current }
		delete updatedStep.generatorPhase // synthetic field, not real schema

		if (titleOverride?.trim()) updatedStep.titleOverride = titleOverride.trim()
		else delete updatedStep.titleOverride

		if (phaseOverride) updatedStep.phaseOverride = phaseOverride
		else delete updatedStep.phaseOverride

		await writeClient
			.patch(projectId)
			.unset([`journeySteps[_key=="${stepKey}"]`])
			.commit()

		let insertPatch = writeClient.patch(projectId).setIfMissing({ journeySteps: [] })
		if (remaining.length === 0 || insertionIndex >= remaining.length) {
			insertPatch = insertPatch.append('journeySteps', [updatedStep])
		} else if (insertionIndex === 0) {
			insertPatch = insertPatch.prepend('journeySteps', [updatedStep])
		} else {
			insertPatch = insertPatch.insert('before', `journeySteps[${insertionIndex}]`, [updatedStep])
		}
		await insertPatch.commit()

		return NextResponse.json({ success: true, moved: true })
	} catch (err) {
		console.error('Failed to edit journey step:', err)
		return NextResponse.json({ error: 'Failed to edit step' }, { status: 500 })
	}
}

export async function DELETE(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id: projectId } = await params
	const { stepKey } = await request.json()

	if (!stepKey || !KEY_PATTERN.test(stepKey)) {
		return NextResponse.json({ error: 'Invalid stepKey' }, { status: 400 })
	}

	try {
		const project = await writeClient.fetch(
			`*[_type == "project" && _id == $projectId][0]{
				"step": journeySteps[_key == $stepKey][0]{
					generators[]->{ _id, derivedFrom }
				}
			}`,
			{ projectId, stepKey }
		)
		if (!project?.step) {
			return NextResponse.json({ error: 'Step not found' }, { status: 404 })
		}

		const gens = project.step.generators || []
		const isLaunch = gens.some((g) => g._id === LAUNCH_ID)
		const isMoneyStep = gens.some((g) => g.derivedFrom && g.derivedFrom !== 'none')

		if (isLaunch || isMoneyStep) {
			return NextResponse.json(
				{ error: "This step drives other behavior in the app and can't be deleted here." },
				{ status: 400 }
			)
		}

		await writeClient
			.patch(projectId)
			.unset([`journeySteps[_key=="${stepKey}"]`])
			.commit()

		return NextResponse.json({ success: true })
	} catch (err) {
		console.error('Failed to delete journey step:', err)
		return NextResponse.json({ error: 'Failed to delete step' }, { status: 500 })
	}
}