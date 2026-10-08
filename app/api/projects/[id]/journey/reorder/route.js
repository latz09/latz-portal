
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import { sanityClient } from '@/app/utils/cms/sanityConnection'

const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/

export async function PATCH(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id } = await params
	const { phase, orderedKeys } = await request.json()

	if (!Array.isArray(orderedKeys) || orderedKeys.length === 0) {
		return NextResponse.json({ error: 'orderedKeys is required' }, { status: 400 })
	}
	if (!orderedKeys.every((k) => typeof k === 'string' && KEY_PATTERN.test(k))) {
		return NextResponse.json({ error: 'Invalid key in orderedKeys' }, { status: 400 })
	}

	const project = await sanityClient.fetch(
		`*[_type == "project" && _id == $id][0]{
			journeySteps[] {
				...,
				"effectivePhase": coalesce(phaseOverride, generators[0]->phase)
			}
		}`,
		{ id }
	)
	if (!project) {
		return NextResponse.json({ error: 'Project not found' }, { status: 404 })
	}

	const currentSteps = project.journeySteps || []
	const phaseKeys = currentSteps
		.filter((s) => s.effectivePhase === phase)
		.map((s) => s._key)

	// orderedKeys must be exactly this phase's current step keys, reordered —
	// same guard pattern as the docs reorder route, scoped to one phase so a
	// stale payload can't silently touch a different phase's steps.
	const sameSet =
		orderedKeys.length === phaseKeys.length &&
		orderedKeys.every((k) => phaseKeys.includes(k))
	if (!sameSet) {
		return NextResponse.json(
			{ error: "orderedKeys must match this phase's current step set" },
			{ status: 400 }
		)
	}

	const byKey = new Map(currentSteps.map((s) => [s._key, s]))
	const phaseKeySet = new Set(phaseKeys)
	let cursor = 0
	const reordered = currentSteps.map((step) => {
		if (!phaseKeySet.has(step._key)) return step
		const nextKey = orderedKeys[cursor]
		cursor += 1
		const { effectivePhase, ...clean } = byKey.get(nextKey)
		return clean
	})

	await writeClient.patch(id).set({ journeySteps: reordered }).commit()

	return NextResponse.json({ success: true })
}
