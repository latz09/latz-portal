import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import crypto from 'crypto'
import { slugify } from '@/app/utils/slugify'
import { PHASE_ORDER, findInsertionIndex } from '@/app/utils/journeyHelpers'

export async function POST(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id: projectId } = await params
	const body = await request.json()
	const { mode } = body

	if (mode !== 'reuse' && mode !== 'create') {
		return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
	}

	try {
		// Fresh (non-CDN) read of the current step order + each step's phase —
		// this is what the insertion index gets computed against.
		const currentSteps = await writeClient.fetch(
			`*[_type == "project" && _id == $projectId][0].journeySteps[] {
				_key,
				"phase": generators[0]->phase
			}`,
			{ projectId }
		)

		if (currentSteps === null) {
			return NextResponse.json({ error: 'Project not found' }, { status: 404 })
		}

		let generatorId
		let phase
		const tx = writeClient.transaction()

		if (mode === 'reuse') {
			generatorId = body.generatorId
			if (!generatorId) {
				return NextResponse.json({ error: 'generatorId is required' }, { status: 400 })
			}
			const existing = await writeClient.fetch(
				`*[_type == "generatorSchema" && _id == $generatorId][0]{ _id, phase }`,
				{ generatorId }
			)
			if (!existing) {
				return NextResponse.json({ error: 'Catalog step not found' }, { status: 404 })
			}
			phase = existing.phase
		} else {
			const { title, phase: phaseInput, isMilestone } = body
			if (!title?.trim()) {
				return NextResponse.json({ error: 'Title is required' }, { status: 400 })
			}
			if (!PHASE_ORDER.includes(phaseInput)) {
				return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
			}
			phase = phaseInput
			generatorId = crypto.randomUUID()

			tx.create({
				_id: generatorId,
				_type: 'generatorSchema',
				title: title.trim(),
				slug: { _type: 'slug', current: slugify(title) },
				phase,
				derivedFrom: 'none',
				assignedTo: 'internal',
				isMilestone: Boolean(isMilestone),
				deprecated: false,
			})
		}

		const newStep = {
			_key: `step-${crypto.randomUUID()}`,
			status: 'todo',
			generators: [
				{ _type: 'reference', _key: `gen-${crypto.randomUUID()}`, _ref: generatorId },
			],
		}

		const insertionIndex = findInsertionIndex(currentSteps, phase)

		tx.patch(projectId, (p) => {
			p.setIfMissing({ journeySteps: [] })
			if (currentSteps.length === 0 || insertionIndex >= currentSteps.length) {
				p.append('journeySteps', [newStep])
			} else if (insertionIndex === 0) {
				p.prepend('journeySteps', [newStep])
			} else {
				p.insert('before', `journeySteps[${insertionIndex}]`, [newStep])
			}
			return p
		})

		await tx.commit()

		return NextResponse.json({ success: true, generatorId, stepKey: newStep._key })
	} catch (err) {
		console.error('Failed to add journey step:', err)
		return NextResponse.json({ error: 'Failed to add step' }, { status: 500 })
	}
}