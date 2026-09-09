'use client'

import { useState, useEffect, useMemo } from 'react'
import { TbX, TbSearch } from 'react-icons/tb'
import { PHASE_LABELS, PHASE_ORDER } from '@/app/utils/journeyHelpers'

const inputClass =
	'w-full bg-dark border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:bg-[#000000]/85 focus:border-teal/80 transition-colors'

const pillClass = (active) =>
	`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
		active
			? 'bg-teal/80 border-teal/30 text-white/90'
			: 'border-white/[0.08] bg-dark text-white/40 hover:text-dark hover:border-teal/40 hover:bg-teal/60 hover:scale-95'
	}`

// Compact labels for the filter row — the full PHASE_LABELS strings
// ("A · Initial Outreach") are correct everywhere else but too long for a
// row of pills you're scanning quickly.
const PHASE_SHORT_LABELS = {
	'a-outreach': 'Outreach',
	'b-close': 'Close',
	'c-kickoff': 'Kickoff',
	'd-design': 'Design',
	'e-build': 'Build',
	'f-prelaunch': 'Prelaunch',
	'g-launch': 'Launch',
	'h-postlaunch': 'Post-Launch',
}

function FieldLabel({ children }) {
	return (
		<label className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
			{children}
		</label>
	)
}

export default function AddStepForm({ projectId, onClose, onAdded }) {
	const [tab, setTab] = useState('reuse') // 'reuse' | 'create'

	const [catalog, setCatalog] = useState(null)
	const [catalogError, setCatalogError] = useState('')
	const [search, setSearch] = useState('')
	const [phaseFilter, setPhaseFilter] = useState('all')
	const [selectedId, setSelectedId] = useState(null)

	const [title, setTitle] = useState('')
	const [phase, setPhase] = useState('d-design')
	const [isMilestone, setIsMilestone] = useState(false)

	const [saving, setSaving] = useState(false)
	const [error, setError] = useState('')

	useEffect(() => {
		if (tab !== 'reuse' || catalog !== null) return
		fetch('/api/generators')
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load catalog')
				return res.json()
			})
			.then(setCatalog)
			.catch(() => setCatalogError('Could not load the step catalog'))
	}, [tab, catalog])

	const filteredCatalog = useMemo(() => {
		if (!catalog) return []
		const q = search.trim().toLowerCase()
		return catalog.filter((g) => {
			const matchesSearch = !q || g.title.toLowerCase().includes(q)
			const matchesPhase = phaseFilter === 'all' || g.phase === phaseFilter
			return matchesSearch && matchesPhase
		})
	}, [catalog, search, phaseFilter])

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		if (tab === 'reuse' && !selectedId) {
			setError('Pick a step from the catalog')
			return
		}
		if (tab === 'create' && !title.trim()) {
			setError('Title is required')
			return
		}

		setSaving(true)
		try {
			const body =
				tab === 'reuse'
					? { mode: 'reuse', generatorId: selectedId }
					: { mode: 'create', title: title.trim(), phase, isMilestone }

			const res = await fetch(`/api/projects/${projectId}/journey/add-step`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			if (!res.ok) {
				const data = await res.json().catch(() => ({}))
				throw new Error(data.error || 'Failed to add step')
			}
			onAdded()
		} catch (err) {
			setError(err.message || 'Something went wrong')
			setSaving(false)
		}
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-dark/50 backdrop-blur-[6px]'
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose()
			}}
		>
			<form
				onSubmit={handleSubmit}
				className='w-full mx-4 sm:mx-2 sm:w-[32rem] bg-[#000000]/50 backdrop-blur-sm border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-dark/60 flex flex-col max-h-[85vh] overflow-y-auto'
			>
				<div className='flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0'>
					<p className='font-mono text-[10px] tracking-widest uppercase text-white/40'>Add Step</p>
					<button type='button' onClick={onClose} className='text-white/30 hover:text-white transition-colors'>
						<TbX className='text-lg' />
					</button>
				</div>

				<div className='flex gap-1.5 px-5 pt-4'>
					<button type='button' onClick={() => setTab('reuse')} className={pillClass(tab === 'reuse')}>
						Reuse Existing
					</button>
					<button type='button' onClick={() => setTab('create')} className={pillClass(tab === 'create')}>
						Create New
					</button>
				</div>

				<div className='px-5 py-5 flex flex-col gap-4'>
					{tab === 'reuse' ? (
						<>
							<div>
								<FieldLabel>Phase</FieldLabel>
								<div className='flex flex-wrap gap-1.5'>
									<button
										type='button'
										onClick={() => setPhaseFilter('all')}
										className={pillClass(phaseFilter === 'all')}
									>
										All
									</button>
									{PHASE_ORDER.map((p) => (
										<button
											key={p}
											type='button'
											onClick={() => setPhaseFilter(p)}
											className={pillClass(phaseFilter === p)}
										>
											{PHASE_SHORT_LABELS[p]}
										</button>
									))}
								</div>
							</div>

							<div className='relative'>
								<TbSearch className='absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm' />
								<input
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder='Search steps…'
									className={`${inputClass} pl-9`}
								/>
							</div>

							{catalogError && <p className='text-[11px] text-danger'>{catalogError}</p>}
							{!catalog && !catalogError && <p className='text-xs text-white/30'>Loading catalog…</p>}

							{catalog && (
								<div className='flex flex-col gap-1 max-h-[28rem] overflow-y-auto border border-white/[0.06] rounded-lg'>
									{filteredCatalog.length === 0 && (
										<p className='text-xs text-white/30 px-3 py-3'>No matching steps</p>
									)}
									{filteredCatalog.map((g) => (
										<button
											key={g._id}
											type='button'
											onClick={() => setSelectedId(g._id)}
											className={`flex items-center justify-between gap-2 px-3 py-2 text-left text-sm border-b border-white/[0.04] last:border-b-0 transition-colors ${
												selectedId === g._id
													? 'bg-teal/15 text-white/90'
													: 'text-white/60 hover:bg-white/[0.04]'
											}`}
										>
											<span className='truncate'>{g.title}</span>
											<span className='font-mono text-[10px] text-white/30 shrink-0'>
												{PHASE_LABELS[g.phase] || g.phase}
											</span>
										</button>
									))}
								</div>
							)}
						</>
					) : (
						<>
							<div>
								<FieldLabel>Title</FieldLabel>
								<input
									autoFocus
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									placeholder='e.g. Extra Revision Round'
									className={inputClass}
								/>
							</div>

							<div>
								<FieldLabel>Phase</FieldLabel>
								<div className='flex flex-wrap gap-1.5'>
									{PHASE_ORDER.map((p) => (
										<button key={p} type='button' onClick={() => setPhase(p)} className={pillClass(phase === p)}>
											{PHASE_LABELS[p]}
										</button>
									))}
								</div>
							</div>

							<button
								type='button'
								onClick={() => setIsMilestone((m) => !m)}
								className={`self-start ${pillClass(isMilestone)}`}
							>
								Milestone
							</button>
						</>
					)}

					{error && <p className='text-[11px] text-danger'>{error}</p>}
				</div>

				<div className='flex gap-2 px-5 py-4 border-t border-white/10 shrink-0'>
					<button
						type='button'
						onClick={onClose}
						className='flex-1 py-2 rounded-lg border border-white/[0.08] text-sm text-white/50 hover:text-white/80 transition-colors'
					>
						Cancel
					</button>
					<button
						type='submit'
						disabled={saving}
						className='flex-1 py-2 rounded-lg bg-teal/15 border border-teal/30 text-sm text-white/90 hover:bg-teal/25 transition-colors disabled:opacity-50'
					>
						{saving ? 'Adding…' : 'Add Step'}
					</button>
				</div>
			</form>
		</div>
	)
}