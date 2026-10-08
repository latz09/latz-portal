'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TbSearch } from 'react-icons/tb';
import { PHASE_LABELS, PHASE_ORDER } from '@/app/utils/journeyHelpers';

const inputClass =
	'w-full bg-dark border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white/90 placeholder:text-white/30 outline-none focus:bg-[#000000]/85 focus:border-teal/80 transition-colors';

const pillClass = (active) =>
	`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
		active
			? 'bg-teal/80 border-teal/30 text-white/90'
			: 'border-white/[0.08] bg-dark text-white/40 hover:text-dark hover:border-teal/40 hover:bg-teal/60 hover:scale-95'
	}`;

const tabClass = (active) =>
	`px-2.5 py-1 rounded-lg text-xs border transition duration-300 ${
		active
			? 'bg-teal/80 border-teal/30 text-white/90'
			: 'border-white/[0.08] bg-dark text-white/40 hover:text-white/70'
	}`;

const PHASE_SHORT_LABELS = {
	'a-outreach': 'Outreach',
	'b-close': 'Close',
	'c-kickoff': 'Kickoff',
	'd-design': 'Design',
	'e-build': 'Build',
	'f-prelaunch': 'Prelaunch',
	'g-launch': 'Launch',
	'h-postlaunch': 'Post-Launch',
};

export default function AddStepInlineRow({ phase, projectId, onDone }) {
	const router = useRouter();
	const [tab, setTab] = useState('reuse'); // 'reuse' | 'create'

	// Reuse tab state
	const [catalog, setCatalog] = useState(null);
	const [catalogError, setCatalogError] = useState('');
	const [search, setSearch] = useState('');
	const [phaseFilter, setPhaseFilter] = useState(phase); // pre-filtered to the phase clicked from
	const [selectedId, setSelectedId] = useState(null);

	// Create tab state
	const [title, setTitle] = useState('');
	const [createPhase, setCreatePhase] = useState(phase);
	const [isMilestone, setIsMilestone] = useState(false);

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (tab !== 'reuse' || catalog !== null) return;
		fetch('/api/generators')
			.then((res) => {
				if (!res.ok) throw new Error('Failed to load catalog');
				return res.json();
			})
			.then(setCatalog)
			.catch(() => setCatalogError('Could not load the step catalog'));
	}, [tab, catalog]);

	const filteredCatalog = useMemo(() => {
		if (!catalog) return [];
		const q = search.trim().toLowerCase();
		return catalog.filter((g) => {
			const matchesSearch = !q || g.title.toLowerCase().includes(q);
			const matchesPhase = phaseFilter === 'all' || g.phase === phaseFilter;
			return matchesSearch && matchesPhase;
		});
	}, [catalog, search, phaseFilter]);

	async function handleSave() {
		setError('');

		if (tab === 'reuse' && !selectedId) {
			setError('Pick a step from the catalog');
			return;
		}
		if (tab === 'create' && !title.trim()) {
			setError('Title is required');
			return;
		}

		setSaving(true);
		try {
			const body =
				tab === 'reuse'
					? { mode: 'reuse', generatorId: selectedId }
					: { mode: 'create', title: title.trim(), phase: createPhase, isMilestone };

			const res = await fetch(`/api/projects/${projectId}/journey/add-step`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const data = await res.json().catch(() => ({}));
				throw new Error(data.error || 'Failed to add step');
			}
			router.refresh();
			onDone();
		} catch (e) {
			setError(e.message || 'Something went wrong');
			setSaving(false);
		}
	}

	return (
		<div className='flex flex-col gap-3 px-3 lg:px-4 py-3 border-b border-white/[0.06] last:border-b-0 bg-teal/[0.03]'>
			<div className='flex items-center justify-between'>
				<p className='font-mono text-[10px] tracking-widest uppercase text-white/30'>
					New Step — {PHASE_LABELS[phase] || phase}
				</p>
				<div className='flex gap-1.5'>
					<button type='button' onClick={() => setTab('reuse')} className={tabClass(tab === 'reuse')}>
						Reuse Existing
					</button>
					<button type='button' onClick={() => setTab('create')} className={tabClass(tab === 'create')}>
						Create New
					</button>
				</div>
			</div>

			{tab === 'reuse' ? (
				<>
					<div className='flex flex-wrap gap-1.5'>
						<button type='button' onClick={() => setPhaseFilter('all')} className={pillClass(phaseFilter === 'all')}>
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
						<div className='flex flex-col gap-1 max-h-64 overflow-y-auto border border-white/[0.06] rounded-lg'>
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
					<input
						autoFocus
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder='e.g. Logo Concepts Review'
						className={inputClass}
					/>

					<div className='flex flex-wrap gap-1.5'>
						{PHASE_ORDER.map((p) => (
							<button
								key={p}
								type='button'
								onClick={() => setCreatePhase(p)}
								className={pillClass(createPhase === p)}
							>
								{PHASE_LABELS[p]}
							</button>
						))}
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

			<div className='flex items-center justify-end gap-3 pt-1'>
				<button type='button' onClick={onDone} className='text-[11px] text-white/40 hover:text-white/70'>
					Cancel
				</button>
				<button
					type='button'
					onClick={handleSave}
					disabled={saving}
					className='font-mono text-[11px] px-2.5 py-1 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors disabled:opacity-50'
				>
					{saving ? 'Adding…' : 'Save'}
				</button>
			</div>
		</div>
	);
}