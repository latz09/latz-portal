export const PROJECT_STATUSES = ['potential', 'active', 'on-hold', 'complete', 'on-ice']

const CLIENT_PAYMENT_NUMBER_FIELDS = ['totalAmount', 'depositAmount', 'finalAmount']
const CLIENT_PAYMENT_BOOLEAN_FIELDS = ['depositPaid', 'finalPaid']
const CLIENT_PAYMENT_DATE_FIELDS = ['depositPaidDate', 'finalPaidDate']
const CLIENT_PAYMENT_TEXT_FIELDS = ['notes']

const DESIGNER_PAYMENT_NUMBER_FIELDS = ['quoteLow', 'quoteHigh', 'hourlyRate', 'actualHours', 'actualAmount', 'amountPaid']
const DESIGNER_PAYMENT_BOOLEAN_FIELDS = ['assigned']
const DESIGNER_PAYMENT_DATE_FIELDS = ['dateInvoiced', 'datePaid']
const DESIGNER_PAYMENT_TEXT_FIELDS = ['invoiceNumber', 'notes']
const DESIGNER_PAYMENT_STATUSES = ['not-started', 'in-progress', 'delivered', 'invoiced', 'paid']

function pickNumber(value) {
	if (value === '' || value === null || value === undefined) return undefined
	const n = Number(value)
	return Number.isFinite(n) ? n : undefined
}

function pickDate(value) {
	if (!value) return undefined
	return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined
}

function pickText(value) {
	if (typeof value !== 'string') return undefined
	const trimmed = value.trim()
	return trimmed || undefined
}

export function sanitizeClientPayment(input = {}) {
	const out = {}
	for (const f of CLIENT_PAYMENT_NUMBER_FIELDS) {
		const v = pickNumber(input[f])
		if (v !== undefined) out[f] = v
	}
	for (const f of CLIENT_PAYMENT_BOOLEAN_FIELDS) {
		out[f] = Boolean(input[f])
	}
	for (const f of CLIENT_PAYMENT_DATE_FIELDS) {
		const v = pickDate(input[f])
		if (v !== undefined) out[f] = v
	}
	for (const f of CLIENT_PAYMENT_TEXT_FIELDS) {
		const v = pickText(input[f])
		if (v !== undefined) out[f] = v
	}
	return out
}

export function sanitizeDesignerPayment(input = {}) {
	const out = {}
	for (const f of DESIGNER_PAYMENT_NUMBER_FIELDS) {
		const v = pickNumber(input[f])
		if (v !== undefined) out[f] = v
	}
	for (const f of DESIGNER_PAYMENT_BOOLEAN_FIELDS) {
		out[f] = Boolean(input[f])
	}
	for (const f of DESIGNER_PAYMENT_DATE_FIELDS) {
		const v = pickDate(input[f])
		if (v !== undefined) out[f] = v
	}
	for (const f of DESIGNER_PAYMENT_TEXT_FIELDS) {
		const v = pickText(input[f])
		if (v !== undefined) out[f] = v
	}
	if (input.status && DESIGNER_PAYMENT_STATUSES.includes(input.status)) {
		out.status = input.status
	}
	return out
}

export function validateOverviewFields({ name, status, month, year }) {
	const errors = []
	if (!name || !name.trim()) errors.push('Project name is required')
	if (status && !PROJECT_STATUSES.includes(status)) errors.push('Invalid status')
	if (month !== undefined && month !== null && month !== '') {
		const m = Number(month)
		if (!Number.isInteger(m) || m < 1 || m > 12) errors.push('Invalid month')
	}
	if (year !== undefined && year !== null && year !== '') {
		const y = Number(year)
		if (!Number.isInteger(y) || y < 2000 || y > 2100) errors.push('Invalid year')
	}
	return errors
}