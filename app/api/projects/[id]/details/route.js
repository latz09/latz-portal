import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import {
	PROJECT_STATUSES,
	sanitizeClientPayment,
	sanitizeDesignerPayment,
	validateOverviewFields,
} from '@/app/utils/cms/projectDetailsHelpers'

export async function PATCH(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id } = await params
	const body = await request.json()
	const {
		name,
		status,
		month,
		year,
		estimateWeeksLow,
		estimateWeeksHigh,
		lostReason,
		clientPayment,
		designerPayment,
	} = body

	const overviewErrors = validateOverviewFields({ name, status, month, year })
	if (overviewErrors.length) {
		return NextResponse.json({ error: overviewErrors[0] }, { status: 400 })
	}

	const setFields = {
		name: name.trim(),
		status: PROJECT_STATUSES.includes(status) ? status : 'potential',
		clientPayment: sanitizeClientPayment(clientPayment),
		designerPayment: sanitizeDesignerPayment(designerPayment),
	}
	const unsetFields = []

	if (month !== undefined && month !== null && month !== '') {
		setFields.month = Number(month)
	} else {
		unsetFields.push('month')
	}

	if (year !== undefined && year !== null && year !== '') {
		setFields.year = Number(year)
	} else {
		unsetFields.push('year')
	}

	if (estimateWeeksLow !== undefined && estimateWeeksLow !== null && estimateWeeksLow !== '') {
		setFields.estimateWeeksLow = Number(estimateWeeksLow)
	} else {
		unsetFields.push('estimateWeeksLow')
	}

	if (estimateWeeksHigh !== undefined && estimateWeeksHigh !== null && estimateWeeksHigh !== '') {
		setFields.estimateWeeksHigh = Number(estimateWeeksHigh)
	} else {
		unsetFields.push('estimateWeeksHigh')
	}

	// lostReason only makes sense on-ice — clear it if the status moved off on-ice,
	// even if the person never touched the textarea, so stale reasons don't linger.
	if (setFields.status === 'on-ice' && lostReason?.trim()) {
		setFields.lostReason = lostReason.trim()
	} else {
		unsetFields.push('lostReason')
	}

	try {
		const patch = writeClient.patch(id).set(setFields)
		if (unsetFields.length) patch.unset(unsetFields)
		await patch.commit()

		return NextResponse.json({ success: true })
	} catch (err) {
		console.error('Failed to update project details:', err)
		return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
	}
}