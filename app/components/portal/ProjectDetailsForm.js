'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { TbChevronDown, TbAlertTriangle } from 'react-icons/tb'
import { JOURNEY_TEMPLATES } from '@/app/data/journeyTemplates'
import { slugify } from '@/app/utils/slugify'

const inputClass =
	'w-full bg-dark border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:bg-[#000000]/85 focus:border-teal/80 transition-colors'

const pillClass = (active) =>
	`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
		active
			? 'bg-teal/80 border-teal/30 text-white/90'
			: 'border-white/[0.08] bg-dark text-white/40 hover:text-dark hover:border-teal/40 hover:bg-teal/60 hover:scale-95'
	}`

const STATUS_OPTIONS = [
	{ value: 'potential', label: 'Lead' },
	{ value: 'active', label: 'Active' },
	{ value: 'on-hold', label: 'On Hold' },
	{ value: 'complete', label: 'Complete' },
	{ value: 'on-ice', label: 'Lost' },
]

const DESIGNER_STATUS_OPTIONS = [
	{ value: 'not-started', label: 'Not Started' },
	{ value: 'in-progress', label: 'In Progress' },
	{ value: 'delivered', label: 'Delivered' },
	{ value: 'invoiced', label: 'Invoiced' },
	{ value: 'paid', label: 'Paid' },
]

const MONTH_OPTIONS = [
	'January', 'February', 'March', 'April', 'May', 'June',
	'July', 'August', 'September', 'October', 'November', 'December',
].map((label, i) => ({ value: i + 1, label }))

const TEMPLATE_OPTIONS = Object.entries(JOURNEY_TEMPLATES).map(([key, t]) => ({
	value: key,
	label: t.label,
}))

function formatMoney(n) {
	if (n === undefined || n === null || n === '') return null
	return `$${Number(n).toLocaleString()}`
}

function summarizeClientPayment(cp) {
	if (!cp?.totalAmount) return 'No price set'
	const status = cp.finalPaid ? 'Paid in full' : cp.depositPaid ? 'Deposit paid' : 'Unpaid'
	return `${formatMoney(cp.totalAmount)} · ${status}`
}

function summarizeDesignerPayment(dp) {
	if (!dp?.assigned) return 'Not assigned'
	const amount = dp.actualAmount
		? formatMoney(dp.actualAmount)
		: dp.quoteLow && dp.quoteHigh
			? `${formatMoney(dp.quoteLow)}–${formatMoney(dp.quoteHigh)}`
			: 'No quote set'
	const statusLabel = DESIGNER_STATUS_OPTIONS.find((o) => o.value === dp.status)?.label || 'Not Started'
	return `${amount} · ${statusLabel}`
}

function FieldLabel({ children }) {
	return (
		<label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
			{children}
		</label>
	)
}

function CollapsibleSection({ title, summary, defaultOpen, children }) {
	const [open, setOpen] = useState(defaultOpen)
	return (
		<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden'>
			<button
				type='button'
				onClick={() => setOpen((o) => !o)}
				className='w-full flex items-center justify-between px-5 py-4 text-left'
			>
				<span className='font-mono text-xs tracking-widest uppercase text-white/70'>{title}</span>
				<div className='flex items-center gap-3 min-w-0'>
					<span className='text-xs text-white/40 truncate'>{summary}</span>
					<TbChevronDown
						className={`text-white/40 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
					/>
				</div>
			</button>
			{open && (
				<div className='px-5 pb-5 pt-4 border-t border-white/[0.06] flex flex-col gap-4'>{children}</div>
			)}
		</div>
	)
}

export default function ProjectDetailsForm({ mode, initialData = null, clientContext = null }) {
	const router = useRouter()

	const [clientName, setClientName] = useState(
		mode === 'edit' ? initialData?.clientName || '' : ''
	)
	const [projectName, setProjectName] = useState(initialData?.name || '')
	const [status, setStatus] = useState(initialData?.status || 'potential')
	const [month, setMonth] = useState(initialData?.month || '')
	const [year, setYear] = useState(initialData?.year || '')
	const [estimateWeeksLow, setEstimateWeeksLow] = useState(initialData?.estimateWeeksLow || '')
	const [estimateWeeksHigh, setEstimateWeeksHigh] = useState(initialData?.estimateWeeksHigh || '')
	const [lostReason, setLostReason] = useState(initialData?.lostReason || '')
	const [templateKey, setTemplateKey] = useState('standard')

	const [clientSlug, setClientSlug] = useState('')
	const [clientSlugTouched, setClientSlugTouched] = useState(false)
	const [clientSlugStatus, setClientSlugStatus] = useState('idle') // idle | checking | available | taken

	const [projectSlug, setProjectSlug] = useState('')
	const [projectSlugTouched, setProjectSlugTouched] = useState(false)
	const [projectSlugStatus, setProjectSlugStatus] = useState('idle')

	const [clientPayment, setClientPayment] = useState({
		totalAmount: initialData?.clientPayment?.totalAmount || '',
		depositAmount: initialData?.clientPayment?.depositAmount || '',
		depositPaid: initialData?.clientPayment?.depositPaid || false,
		depositPaidDate: initialData?.clientPayment?.depositPaidDate || '',
		finalAmount: initialData?.clientPayment?.finalAmount || '',
		finalPaid: initialData?.clientPayment?.finalPaid || false,
		finalPaidDate: initialData?.clientPayment?.finalPaidDate || '',
		notes: initialData?.clientPayment?.notes || '',
	})

	const [designerPayment, setDesignerPayment] = useState({
		assigned: initialData?.designerPayment?.assigned || false,
		quoteLow: initialData?.designerPayment?.quoteLow || '',
		quoteHigh: initialData?.designerPayment?.quoteHigh || '',
		hourlyRate: initialData?.designerPayment?.hourlyRate ?? 50,
		actualHours: initialData?.designerPayment?.actualHours || '',
		actualAmount: initialData?.designerPayment?.actualAmount || '',
		status: initialData?.designerPayment?.status || 'not-started',
		invoiceNumber: initialData?.designerPayment?.invoiceNumber || '',
		dateInvoiced: initialData?.designerPayment?.dateInvoiced || '',
		datePaid: initialData?.designerPayment?.datePaid || '',
		amountPaid: initialData?.designerPayment?.amountPaid || '',
		notes: initialData?.designerPayment?.notes || '',
	})

	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	const paymentsDefaultOpen = Boolean(
		initialData?.clientPayment?.totalAmount || initialData?.designerPayment?.assigned
	)

	// Slug fields track the name live until the person edits the slug
	// directly — same behavior as Studio's own slug widget.
	useEffect(() => {
		if (mode !== 'create' || clientSlugTouched) return
		setClientSlug(slugify(clientName))
	}, [clientName, clientSlugTouched, mode])

	useEffect(() => {
		if (mode === 'edit' || projectSlugTouched) return
		setProjectSlug(slugify(projectName))
	}, [projectName, projectSlugTouched, mode])

	const patchClientPayment = (fields) => setClientPayment((cp) => ({ ...cp, ...fields }))
	const patchDesignerPayment = (fields) => setDesignerPayment((dp) => ({ ...dp, ...fields }))

	const handleSplit5050 = () => {
		const total = Number(clientPayment.totalAmount)
		if (!Number.isFinite(total) || total <= 0) return
		const half = Math.round(total / 2)
		patchClientPayment({ depositAmount: half, finalAmount: total - half })
	}

	const checkClientSlug = async () => {
		const candidate = slugify(clientSlug)
		setClientSlug(candidate)
		if (!candidate) return
		setClientSlugStatus('checking')
		try {
			const res = await fetch(`/api/clients/check-slug?slug=${encodeURIComponent(candidate)}`)
			const data = await res.json()
			setClientSlugStatus(data.available ? 'available' : 'taken')
		} catch {
			setClientSlugStatus('idle')
		}
	}

	const checkProjectSlug = async () => {
		const candidate = slugify(projectSlug)
		setProjectSlug(candidate)
		if (!candidate) return
		setProjectSlugStatus('checking')
		const clientIdForCheck =
			mode === 'add-project' ? clientContext?._id : mode === 'edit' ? initialData?.clientId : ''
		try {
			const params = new URLSearchParams({ slug: candidate })
			if (clientIdForCheck) params.set('clientId', clientIdForCheck)
			const res = await fetch(`/api/projects/check-slug?${params.toString()}`)
			const data = await res.json()
			setProjectSlugStatus(data.available ? 'available' : 'taken')
		} catch {
			setProjectSlugStatus('idle')
		}
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		if (mode === 'create' && !clientName.trim()) {
			setError('Client name is required')
			return
		}
		if (!projectName.trim()) {
			setError('Project name is required')
			return
		}
		if (mode === 'create' && clientSlugStatus === 'taken') {
			setError('Client slug is already taken — pick a different one')
			return
		}
		if (mode !== 'edit' && projectSlugStatus === 'taken') {
			setError('Project slug is already taken — pick a different one')
			return
		}

		setSaving(true)

		const payload = {
			status,
			month: month || undefined,
			year: year || undefined,
			estimateWeeksLow: estimateWeeksLow || undefined,
			estimateWeeksHigh: estimateWeeksHigh || undefined,
			lostReason: status === 'on-ice' ? lostReason : '',
			clientPayment,
			designerPayment,
		}

		try {
			if (mode === 'create') {
				const res = await fetch('/api/clients', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						...payload,
						clientName: clientName.trim(),
						clientSlug,
						projectName: projectName.trim(),
						projectSlug,
						templateKey,
					}),
				})
				if (!res.ok) {
					const body = await res.json().catch(() => ({}))
					throw new Error(body.error || 'Failed to create client')
				}
				const { client, project } = await res.json()
				router.push(`/clients/${client.slug}/${project.slug}`)
				return
			}

			if (mode === 'add-project') {
				const res = await fetch(`/api/clients/${clientContext._id}/projects`, {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ ...payload, projectName: projectName.trim(), projectSlug, templateKey }),
				})
				if (!res.ok) {
					const body = await res.json().catch(() => ({}))
					throw new Error(body.error || 'Failed to add project')
				}
				const { project } = await res.json()
				router.push(`/clients/${clientContext.slug}/${project.slug}`)
				return
			}

			// edit mode
			if (clientName.trim() && clientName.trim() !== initialData.clientName) {
				const clientRes = await fetch(`/api/clients/${initialData.clientId}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name: clientName.trim() }),
				})
				if (!clientRes.ok) {
					const body = await clientRes.json().catch(() => ({}))
					throw new Error(body.error || 'Failed to update client name')
				}
			}

			const projectRes = await fetch(`/api/projects/${initialData.projectId}/details`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ...payload, name: projectName.trim() }),
			})
			if (!projectRes.ok) {
				const body = await projectRes.json().catch(() => ({}))
				throw new Error(body.error || 'Failed to update project')
			}
			router.push(`/clients/${initialData.clientSlug}/${initialData.projectSlug}`)
		} catch (err) {
			setError(err.message || 'Something went wrong')
			setSaving(false)
		}
	}

	const heading =
		mode === 'create' ? 'New Lead' : mode === 'add-project' ? 'New Project' : 'Edit Details'

	return (
		<form onSubmit={handleSubmit} className='max-w-3xl mx-auto w-full flex flex-col gap-6 pb-16'>
			<h1 className='text-lg lg:text-xl font-medium opacity-90'>{heading}</h1>

			{/* Overview — always open */}
			<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl p-5 flex flex-col gap-4'>
				<p className='font-mono text-xs tracking-widest uppercase text-white/70'>Overview</p>

				{mode === 'add-project' && (
					<p className='font-mono text-[11px] text-white/40'>
						Adding project for: <span className='text-teal'>{clientContext?.name}</span>
					</p>
				)}

				{(mode === 'create' || mode === 'edit') && (
					<div>
						<FieldLabel>Client Name</FieldLabel>
						<input
							autoFocus={mode === 'create'}
							value={clientName}
							onChange={(e) => setClientName(e.target.value)}
							placeholder='e.g. Village of Hancock'
							className={inputClass}
						/>
					</div>
				)}

				{mode === 'create' && (
					<div>
						<FieldLabel>Client Slug</FieldLabel>
						<div className='flex gap-2'>
							<input
								value={clientSlug}
								onChange={(e) => {
									setClientSlugTouched(true)
									setClientSlug(e.target.value)
									setClientSlugStatus('idle')
								}}
								onBlur={() => setClientSlug((s) => slugify(s))}
								placeholder='auto-generated-from-name'
								className={`${inputClass} font-mono`}
							/>
							<button
								type='button'
								onClick={checkClientSlug}
								className='shrink-0 px-3 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors'
							>
								Check
							</button>
						</div>
						{clientSlugStatus === 'checking' && (
							<p className='text-[11px] text-white/40 mt-1'>Checking…</p>
						)}
						{clientSlugStatus === 'available' && (
							<p className='text-[11px] text-teal mt-1'>✓ Available</p>
						)}
						{clientSlugStatus === 'taken' && (
							<p className='text-[11px] text-danger mt-1'>Already in use by another client</p>
						)}
						<p className='text-[11px] text-white/30 mt-1'>
							Folder: /public/clients/{clientSlug || '…'}/
						</p>
					</div>
				)}

				<div>
					<FieldLabel>Project Name</FieldLabel>
					<input
						autoFocus={mode === 'add-project'}
						value={projectName}
						onChange={(e) => setProjectName(e.target.value)}
						placeholder='e.g. Website Rebuild'
						className={inputClass}
					/>
				</div>

				{mode !== 'edit' && (
					<div>
						<FieldLabel>Project Slug</FieldLabel>
						<div className='flex gap-2'>
							<input
								value={projectSlug}
								onChange={(e) => {
									setProjectSlugTouched(true)
									setProjectSlug(e.target.value)
									setProjectSlugStatus('idle')
								}}
								onBlur={() => setProjectSlug((s) => slugify(s))}
								placeholder='auto-generated-from-name'
								className={`${inputClass} font-mono`}
							/>
							<button
								type='button'
								onClick={checkProjectSlug}
								className='shrink-0 px-3 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors'
							>
								Check
							</button>
						</div>
						{projectSlugStatus === 'checking' && (
							<p className='text-[11px] text-white/40 mt-1'>Checking…</p>
						)}
						{projectSlugStatus === 'available' && (
							<p className='text-[11px] text-teal mt-1'>✓ Available</p>
						)}
						{projectSlugStatus === 'taken' && (
							<p className='text-[11px] text-danger mt-1'>
								Already used by another project for this client
							</p>
						)}
						<p className='text-[11px] text-white/30 mt-1'>
							Folder: /public/clients/
							{mode === 'create' ? clientSlug || '…' : clientContext?.slug}/{projectSlug || '…'}/
						</p>
					</div>
				)}

				<div>
					<FieldLabel>Status</FieldLabel>
					<div className='flex flex-wrap gap-1.5'>
						{STATUS_OPTIONS.map((opt) => (
							<button
								key={opt.value}
								type='button'
								onClick={() => setStatus(opt.value)}
								className={pillClass(status === opt.value)}
							>
								{opt.label}
							</button>
						))}
					</div>
				</div>

				{status === 'on-ice' && (
					<div>
						<FieldLabel>Why lost?</FieldLabel>
						<textarea
							value={lostReason}
							onChange={(e) => setLostReason(e.target.value)}
							rows={2}
							placeholder='Went with someone else, budget fell through, ghosted, etc.'
							className={`${inputClass} resize-none`}
						/>
					</div>
				)}

				<div className='grid grid-cols-2 gap-3'>
					<div>
						<FieldLabel>Month</FieldLabel>
						<select
							value={month}
							onChange={(e) => setMonth(e.target.value)}
							className={inputClass}
						>
							<option value=''>—</option>
							{MONTH_OPTIONS.map((opt) => (
								<option key={opt.value} value={opt.value}>
									{opt.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<FieldLabel>Year</FieldLabel>
						<input
							type='number'
							value={year}
							onChange={(e) => setYear(e.target.value)}
							placeholder='2026'
							className={inputClass}
						/>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-3'>
					<div>
						<FieldLabel>Estimated Weeks — Low</FieldLabel>
						<input
							type='number'
							value={estimateWeeksLow}
							onChange={(e) => setEstimateWeeksLow(e.target.value)}
							className={inputClass}
						/>
					</div>
					<div>
						<FieldLabel>Estimated Weeks — High</FieldLabel>
						<input
							type='number'
							value={estimateWeeksHigh}
							onChange={(e) => setEstimateWeeksHigh(e.target.value)}
							className={inputClass}
						/>
					</div>
				</div>

				{(mode === 'create' || mode === 'add-project') && (
					<div>
						<FieldLabel>Journey Template</FieldLabel>
						<div className='flex flex-wrap gap-1.5'>
							{TEMPLATE_OPTIONS.map((opt) => (
								<button
									key={opt.value}
									type='button'
									onClick={() => setTemplateKey(opt.value)}
									className={pillClass(templateKey === opt.value)}
								>
									{opt.label}
								</button>
							))}
						</div>
					</div>
				)}
			</div>

			{/* Client Payment */}
			<CollapsibleSection
				title='Client Payment'
				summary={summarizeClientPayment(clientPayment)}
				defaultOpen={paymentsDefaultOpen}
			>
				<div className='grid grid-cols-2 gap-3'>
					<div>
						<FieldLabel>Total Project Price ($)</FieldLabel>
						<input
							type='number'
							value={clientPayment.totalAmount}
							onChange={(e) => patchClientPayment({ totalAmount: e.target.value })}
							className={inputClass}
						/>
					</div>
					<div className='flex items-end'>
						<button
							type='button'
							onClick={handleSplit5050}
							disabled={!clientPayment.totalAmount}
							className='w-full py-2 rounded-lg border border-white/[0.08] text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-colors disabled:opacity-30 disabled:hover:text-white/50 disabled:hover:border-white/[0.08]'
						>
							Split 50/50
						</button>
					</div>
				</div>

				<div className='grid grid-cols-2 gap-3'>
					<div>
						<FieldLabel>Deposit Amount ($)</FieldLabel>
						<input
							type='number'
							value={clientPayment.depositAmount}
							onChange={(e) => patchClientPayment({ depositAmount: e.target.value })}
							className={inputClass}
						/>
					</div>
					<div>
						<FieldLabel>Final / Launch Amount ($)</FieldLabel>
						<input
							type='number'
							value={clientPayment.finalAmount}
							onChange={(e) => patchClientPayment({ finalAmount: e.target.value })}
							className={inputClass}
						/>
					</div>
				</div>

				<div className='flex flex-wrap gap-3 items-center'>
					<button
						type='button'
						onClick={() => patchClientPayment({ depositPaid: !clientPayment.depositPaid })}
						className={pillClass(clientPayment.depositPaid)}
					>
						Deposit Paid
					</button>
					{clientPayment.depositPaid && (
						<input
							type='date'
							value={clientPayment.depositPaidDate}
							onChange={(e) => patchClientPayment({ depositPaidDate: e.target.value })}
							className={`${inputClass} w-auto`}
						/>
					)}
				</div>

				<div className='flex flex-wrap gap-3 items-center'>
					<button
						type='button'
						onClick={() => patchClientPayment({ finalPaid: !clientPayment.finalPaid })}
						className={pillClass(clientPayment.finalPaid)}
					>
						Final Paid
					</button>
					{clientPayment.finalPaid && (
						<input
							type='date'
							value={clientPayment.finalPaidDate}
							onChange={(e) => patchClientPayment({ finalPaidDate: e.target.value })}
							className={`${inputClass} w-auto`}
						/>
					)}
				</div>

				<div>
					<FieldLabel>Notes</FieldLabel>
					<textarea
						value={clientPayment.notes}
						onChange={(e) => patchClientPayment({ notes: e.target.value })}
						rows={2}
						placeholder='Anything non-standard about this arrangement.'
						className={`${inputClass} resize-none`}
					/>
				</div>
			</CollapsibleSection>

			{/* Designer Payment */}
			<CollapsibleSection
				title='Designer Payment (Alyssa)'
				summary={summarizeDesignerPayment(designerPayment)}
				defaultOpen={paymentsDefaultOpen}
			>
				<button
					type='button'
					onClick={() => patchDesignerPayment({ assigned: !designerPayment.assigned })}
					className={`self-start ${pillClass(designerPayment.assigned)}`}
				>
					Assigned to Alyssa
				</button>

				{designerPayment.assigned && (
					<>
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Quoted Range — Low ($)</FieldLabel>
								<input
									type='number'
									value={designerPayment.quoteLow}
									onChange={(e) => patchDesignerPayment({ quoteLow: e.target.value })}
									className={inputClass}
								/>
							</div>
							<div>
								<FieldLabel>Quoted Range — High ($)</FieldLabel>
								<input
									type='number'
									value={designerPayment.quoteHigh}
									onChange={(e) => patchDesignerPayment({ quoteHigh: e.target.value })}
									className={inputClass}
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Hourly Rate ($)</FieldLabel>
								<input
									type='number'
									value={designerPayment.hourlyRate}
									onChange={(e) => patchDesignerPayment({ hourlyRate: e.target.value })}
									className={inputClass}
								/>
							</div>
							<div>
								<FieldLabel>Actual Hours Logged</FieldLabel>
								<input
									type='number'
									value={designerPayment.actualHours}
									onChange={(e) => patchDesignerPayment({ actualHours: e.target.value })}
									className={inputClass}
								/>
							</div>
						</div>

						<div>
							<FieldLabel>Actual Amount Owed ($)</FieldLabel>
							<input
								type='number'
								value={designerPayment.actualAmount}
								onChange={(e) => patchDesignerPayment({ actualAmount: e.target.value })}
								placeholder='Usually hours × rate — the final number she tells you'
								className={inputClass}
							/>
						</div>

						<div>
							<FieldLabel>Status</FieldLabel>
							<div className='flex flex-wrap gap-1.5'>
								{DESIGNER_STATUS_OPTIONS.map((opt) => (
									<button
										key={opt.value}
										type='button'
										onClick={() => patchDesignerPayment({ status: opt.value })}
										className={pillClass(designerPayment.status === opt.value)}
									>
										{opt.label}
									</button>
								))}
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Invoice #</FieldLabel>
								<input
									value={designerPayment.invoiceNumber}
									onChange={(e) => patchDesignerPayment({ invoiceNumber: e.target.value })}
									className={inputClass}
								/>
							</div>
							<div>
								<FieldLabel>Amount Actually Paid ($)</FieldLabel>
								<input
									type='number'
									value={designerPayment.amountPaid}
									onChange={(e) => patchDesignerPayment({ amountPaid: e.target.value })}
									className={inputClass}
								/>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Date Invoiced</FieldLabel>
								<input
									type='date'
									value={designerPayment.dateInvoiced}
									onChange={(e) => patchDesignerPayment({ dateInvoiced: e.target.value })}
									className={inputClass}
								/>
							</div>
							<div>
								<FieldLabel>Date Paid</FieldLabel>
								<input
									type='date'
									value={designerPayment.datePaid}
									onChange={(e) => patchDesignerPayment({ datePaid: e.target.value })}
									className={inputClass}
								/>
							</div>
						</div>

						<div>
							<FieldLabel>Notes</FieldLabel>
							<textarea
								value={designerPayment.notes}
								onChange={(e) => patchDesignerPayment({ notes: e.target.value })}
								rows={2}
								className={`${inputClass} resize-none`}
							/>
						</div>
					</>
				)}
			</CollapsibleSection>

			{error && (
				<div className='flex items-center gap-2 text-sm text-danger'>
					<TbAlertTriangle className='shrink-0' />
					{error}
				</div>
			)}

			<div className='flex gap-2'>
				<button
					type='button'
					onClick={() => router.back()}
					className='flex-1 py-2.5 rounded-lg border border-white/[0.08] text-sm text-white/50 hover:text-white/80 transition-colors'
				>
					Cancel
				</button>
				<button
					type='submit'
					disabled={saving}
					className='flex-1 py-2.5 rounded-lg bg-teal/15 border border-teal/30 text-sm text-white/90 hover:bg-teal/25 transition-colors disabled:opacity-50'
				>
					{saving ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create'}
				</button>
			</div>
		</form>
	)
}