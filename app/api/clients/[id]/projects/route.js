import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import crypto from 'crypto'
import { slugify, isProjectSlugAvailable } from '@/app/utils/cms/slugHelpers'
import {
	PROJECT_STATUSES,
	sanitizeClientPayment,
	sanitizeDesignerPayment,
	validateOverviewFields,
} from '@/app/utils/cms/projectDetailsHelpers'
import {
	buildJourneyStepsFromTemplate,
	buildDefaultDocsFromTemplate,
	isValidTemplateKey,
} from '@/app/utils/journeyTemplateBuilder'

export async function POST(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id: clientId } = await params
	const body = await request.json()
	const {
		projectName,
		projectSlug: projectSlugInput,
		status,
		month,
		year,
		estimateWeeksLow,
		estimateWeeksHigh,
		lostReason,
		clientPayment,
		designerPayment,
		templateKey,
	} = body

	const overviewErrors = validateOverviewFields({ name: projectName, status, month, year })
	if (overviewErrors.length) {
		return NextResponse.json({ error: overviewErrors[0] }, { status: 400 })
	}

	const projectSlug = slugify(projectSlugInput || projectName)
	if (!projectSlug) {
		return NextResponse.json({ error: 'Project slug is required' }, { status: 400 })
	}

	const resolvedTemplateKey = templateKey && isValidTemplateKey(templateKey) ? templateKey : 'blank'

	try {
		const client = await writeClient.fetch(
			`*[_type == "client" && _id == $clientId][0]{ _id, "slug": slug.current }`,
			{ clientId }
		)
		if (!client) {
			return NextResponse.json({ error: 'Client not found' }, { status: 404 })
		}

		if (!(await isProjectSlugAvailable(projectSlug, clientId))) {
			return NextResponse.json(
				{ error: `Slug "${projectSlug}" is already used by another project for this client` },
				{ status: 409 }
			)
		}

		const projectId = crypto.randomUUID()

		const projectDoc = {
			_id: projectId,
			_type: 'project',
			client: { _type: 'reference', _ref: clientId },
			name: projectName.trim(),
			slug: { _type: 'slug', current: projectSlug },
			status: PROJECT_STATUSES.includes(status) ? status : 'potential',
			...(month ? { month: Number(month) } : {}),
			...(year ? { year: Number(year) } : {}),
			...(estimateWeeksLow ? { estimateWeeksLow: Number(estimateWeeksLow) } : {}),
			...(estimateWeeksHigh ? { estimateWeeksHigh: Number(estimateWeeksHigh) } : {}),
			...(lostReason?.trim() ? { lostReason: lostReason.trim() } : {}),
			clientPayment: sanitizeClientPayment(clientPayment),
			designerPayment: sanitizeDesignerPayment(designerPayment),
			docs: buildDefaultDocsFromTemplate(resolvedTemplateKey),
			journeySteps: buildJourneyStepsFromTemplate(resolvedTemplateKey),
		}

		await writeClient.create(projectDoc)

		return NextResponse.json({
			success: true,
			client: { _id: client._id, slug: client.slug },
			project: { _id: projectId, slug: projectSlug },
		})
	} catch (err) {
		console.error('Failed to add project to client:', err)
		return NextResponse.json({ error: 'Failed to add project' }, { status: 500 })
	}
}