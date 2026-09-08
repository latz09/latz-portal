// components/notes/NoteForm.jsx
'use client';

import { useState, useRef, useMemo, useEffect, forwardRef } from 'react';
import { useRouter } from 'next/navigation';
import {
	TbX,
	TbPin,
	TbPinFilled,
	TbHourglass,
	TbHourglassEmpty,
	TbChevronDown,
	TbChevronLeft,
	TbChevronRight,
	TbArrowLeft,
	TbBold,
	TbItalic,
	TbList,
	TbListNumbers,
	TbArrowsMaximize,
	TbArrowsMinimize,
	TbAlertTriangle,
} from 'react-icons/tb';
import { useNoteDraft } from './NoteDraftProvider';

const TYPE_OPTIONS = [
	{ value: 'general', label: 'General' },
	{ value: 'idea', label: 'Idea' },
	{ value: 'task', label: 'Task' },
	{ value: 'link', label: 'Link' },
	{ value: 'asset', label: 'Asset' },
	{ value: 'email', label: 'Email' },
];

const POSITIONS = ['left', 'center', 'right'];
const POSITION_JUSTIFY = {
	left: 'sm:justify-start',
	center: 'sm:justify-center',
	right: 'sm:justify-end',
};

const ACTIVE_STATUSES = ['active', 'potential'];

function isActiveOrLead(status) {
	return ACTIVE_STATUSES.includes(status);
}

const focusRing =
	'focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal/60';

function FieldLabel({ children }) {
	return (
		<span className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
			{children}
		</span>
	);
}

const inputClass = `bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-teal/40 w-full ${focusRing}`;

function ToolbarButton({ onClick, title, children }) {
	return (
		<button
			type='button'
			onClick={onClick}
			title={title}
			className={`flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors ${focusRing}`}
		>
			{children}
		</button>
	);
}

function Listbox({ value, onChange, options, placeholder }) {
	const [open, setOpen] = useState(false);
	const ref = useRef(null);

	useEffect(() => {
		function handleClickOutside(e) {
			if (ref.current && !ref.current.contains(e.target)) setOpen(false);
		}
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const selected = options.find((o) => o.value === value);

	return (
		<div ref={ref} className='relative'>
			<button
				type='button'
				onClick={() => setOpen((o) => !o)}
				className={`w-full flex items-center justify-between bg-white/[0.04] border rounded-lg px-3 py-2 text-sm text-left transition-colors ${focusRing} ${
					open ? 'border-teal/40' : 'border-white/[0.08]'
				}`}
			>
				<span className='truncate text-white'>
					{selected ? selected.label : placeholder}
				</span>
				<TbChevronDown
					className={`text-white/30 text-xs shrink-0 ml-2 transition-transform duration-150 ${
						open ? 'rotate-180' : ''
					}`}
				/>
			</button>

			{open && (
				<div className='absolute z-10 mt-1 w-full max-h-56 overflow-y-auto bg-[#181c26] border border-white/10 rounded-lg shadow-xl shadow-black/40 py-1'>
					{options.map((o) => (
						<button
							key={o.value}
							type='button'
							onClick={() => {
								onChange(o.value);
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${focusRing} ${
								o.value === value
									? 'bg-teal/15 text-teal'
									: 'text-white/70 hover:bg-white/[0.06] hover:text-white'
							}`}
						>
							{o.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

const FieldButton = forwardRef(function FieldButton(
	{ label, filled, onClick, disabled },
	ref,
) {
	return (
		<button
			ref={ref}
			type='button'
			onClick={onClick}
			disabled={disabled}
			className={`w-full flex items-center justify-between bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal/30 ${focusRing}`}
		>
			<span className={`truncate ${filled ? 'text-white' : 'text-white/30'}`}>
				{label}
			</span>
			<TbChevronRight className='text-white/30 text-xs shrink-0 ml-2' />
		</button>
	);
});

function PickerList({ title, options, selectedValue, onSelect, onBack }) {
	return (
		<div className='px-5 py-5 flex flex-col gap-1'>
			<button
				type='button'
				onClick={onBack}
				className={`flex items-center gap-2 text-white/40 hover:text-white transition-colors mb-3 -ml-1 rounded ${focusRing}`}
			>
				<TbArrowLeft className='text-base' />
				<span className='font-mono text-[11px] tracking-widest uppercase'>
					{title}
				</span>
			</button>
			{options.map((o) => (
				<button
					key={o.value || '__none'}
					type='button'
					onClick={() => onSelect(o.value)}
					className={`text-left px-4 py-3 rounded-lg font-mono text-sm transition-colors ${focusRing} ${
						o.value === selectedValue
							? 'bg-teal/15 text-teal'
							: 'text-white/70 hover:bg-white/[0.06] hover:text-white'
					}`}
				>
					{o.label}
				</button>
			))}
		</div>
	);
}

export default function NoteForm({ mode = 'create' }) {
	const router = useRouter();
	const isEdit = mode === 'edit';
	const noteDraft = useNoteDraft();
	const { clients, pageContext } = noteDraft;

	const open = isEdit ? noteDraft.editOpen : noteDraft.open;
	const draft = isEdit ? noteDraft.editDraft : noteDraft.draft;
	const setDraft = isEdit ? noteDraft.setEditDraft : noteDraft.setDraft;
	const closeForm = isEdit ? noteDraft.closeEditNote : noteDraft.closeNote;

	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [position, setPosition] = useState('right');
	const [expanded, setExpanded] = useState(false);
	const [activePicker, setActivePicker] = useState(null);
	const [isTouch, setIsTouch] = useState(false);

	const textareaRef = useRef(null);
	const titleRef = useRef(null);
	const projectButtonRef = useRef(null);

	useEffect(() => {
		setIsTouch(window.matchMedia('(pointer: coarse)').matches);
	}, []);

	useEffect(() => {
		if (!open || isTouch) return;
		if (activePicker) return;
		requestAnimationFrame(() => titleRef.current?.focus());
	}, [open]); // eslint-disable-line react-hooks/exhaustive-deps

	function cyclePosition(direction) {
		setPosition((prev) => {
			const idx = POSITIONS.indexOf(prev);
			return POSITIONS[(idx + direction + POSITIONS.length) % POSITIONS.length];
		});
	}

	const activeClients = useMemo(
		() => (clients || []).filter((c) => c.projects?.some((p) => isActiveOrLead(p.status))),
		[clients],
	);

	const selectedClient = activeClients.find((c) => c._id === draft.clientId) || null;

	const rawProjects = useMemo(() => {
		if (!selectedClient) return [];
		const filtered = (selectedClient.projects || []).filter((p) =>
			isActiveOrLead(p.status),
		);
		if (pageContext && selectedClient._id === pageContext.clientId) {
			return [...filtered].sort((a, b) => {
				if (a._id === pageContext.projectId) return -1;
				if (b._id === pageContext.projectId) return 1;
				return 0;
			});
		}
		return filtered;
	}, [selectedClient, pageContext]);

	const clientOptions = [
		{ value: '', label: '— No client —' },
		...activeClients.map((c) => ({ value: c._id, label: c.name })),
	];
	const projectOptions = [
		{ value: '', label: '— No project —' },
		...rawProjects.map((p) => ({ value: p._id, label: p.name })),
	];

	function handleSelectClient(clientId) {
		const client = activeClients.find((c) => c._id === clientId) || null;
		setDraft((d) => ({
			...d,
			clientId,
			clientName: client?.name || '',
			projectId: '',
			projectName: '',
		}));
		setActivePicker(null);
		requestAnimationFrame(() => {
			if (clientId) {
				projectButtonRef.current?.focus();
			} else {
				textareaRef.current?.focus();
			}
		});
	}

	function handleSelectProject(projectId) {
		const project = rawProjects.find((p) => p._id === projectId) || null;
		setDraft((d) => ({
			...d,
			projectId,
			projectName: project?.name || '',
		}));
		setActivePicker(null);
		requestAnimationFrame(() => {
			textareaRef.current?.focus();
		});
	}

	function applyWrap(marker) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const body = draft.body;
		const selected = body.slice(start, end);
		const newText = body.slice(0, start) + marker + selected + marker + body.slice(end);
		setDraft((d) => ({ ...d, body: newText }));
		const cursorStart = start + marker.length;
		const cursorEnd = cursorStart + selected.length;
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(cursorStart, cursorEnd);
		});
	}

	function applyLinePrefix(getPrefix) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const body = draft.body;
		const lineStart = body.lastIndexOf('\n', start - 1) + 1;
		let lineEnd = body.indexOf('\n', end);
		if (lineEnd === -1) lineEnd = body.length;
		const block = body.slice(lineStart, lineEnd);
		const lines = block.split('\n');
		const prefixed = lines.map((line, i) => `${getPrefix(i)}${line}`).join('\n');
		const newText = body.slice(0, lineStart) + prefixed + body.slice(lineEnd);
		setDraft((d) => ({ ...d, body: newText }));
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(lineStart, lineStart + prefixed.length);
		});
	}

	const handleBold = () => applyWrap('**');
	const handleItalic = () => applyWrap('*');
	const handleBullet = () => applyLinePrefix(() => '- ');
	const handleNumbered = () => applyLinePrefix((i) => `${i + 1}. `);

	function handleClose() {
		setActivePicker(null);
		closeForm();
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!draft.title.trim() || saving) return;

		setSaving(true);
		setError(null);

		try {
			const res = await fetch(isEdit ? `/api/notes/${draft._id}` : '/api/notes', {
				method: isEdit ? 'PATCH' : 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: draft.title.trim(),
					body: draft.body.trim(),
					type: draft.type,
					pinned: draft.pinned,
					backBurner: draft.backBurner,
					clientId: draft.clientId || null,
					projectId: draft.projectId || null,
				}),
			});

			if (!res.ok) throw new Error('Failed');

			if (!isEdit) noteDraft.resetDraft();
			setExpanded(false);
			setActivePicker(null);
			setSaving(false);
			closeForm();
			router.refresh();
		} catch {
			setError('Could not save — try again.');
			setSaving(false);
		}
	}

	return (
		<div
			className={`fixed inset-0 z-[999999] flex items-end justify-center ${POSITION_JUSTIFY[position]} sm:p-6 pointer-events-none`}
		>
			<form
				onSubmit={handleSubmit}
				className={`w-full bg-[#12151c] border border-warning/30 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-dark-mid/30 flex flex-col overflow-y-auto will-change-transform transition-[transform,opacity,max-width,max-height] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
					open
						? 'translate-y-0 opacity-100 pointer-events-auto'
						: 'translate-y-full opacity-0 pointer-events-none'
				} ${
					expanded
						? 'max-h-[96vh] sm:max-h-[92vh] sm:w-[36rem] 2xl:w-[48rem]'
						: 'max-h-[85vh] sm:w-[30rem] 2xl:w-[40rem]'
				}`}
			>
				<div className='flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0'>
					<p className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
						{isEdit ? 'Edit Note' : 'Add Note'}
					</p>
					<div className='flex items-center gap-1'>
						<button
							type='button'
							onClick={() => setExpanded((e) => !e)}
							title={expanded ? 'Collapse' : 'Expand'}
							className={`inline-flex text-white/30 hover:text-white transition-colors p-1 rounded ${focusRing}`}
						>
							{expanded ? (
								<TbArrowsMinimize className='text-base' />
							) : (
								<TbArrowsMaximize className='text-base' />
							)}
						</button>
						<button
							type='button'
							onClick={() => cyclePosition(-1)}
							title='Move left'
							className={`hidden sm:inline-flex text-white/30 hover:text-white transition-colors p-1 rounded ${focusRing}`}
						>
							<TbChevronLeft className='text-base' />
						</button>
						<button
							type='button'
							onClick={() => cyclePosition(1)}
							title='Move right'
							className={`hidden sm:inline-flex text-white/30 hover:text-white transition-colors p-1 rounded ${focusRing}`}
						>
							<TbChevronRight className='text-base' />
						</button>
						<button
							type='button'
							onClick={handleClose}
							className={`text-white/30 hover:text-white transition-colors ml-1 rounded ${focusRing}`}
						>
							<TbX className='text-lg' />
						</button>
					</div>
				</div>

				{activePicker === 'client' ? (
					<PickerList
						title='Select Client'
						options={clientOptions}
						selectedValue={draft.clientId}
						onSelect={handleSelectClient}
						onBack={() => setActivePicker(null)}
					/>
				) : activePicker === 'project' ? (
					<PickerList
						title='Select Project'
						options={projectOptions}
						selectedValue={draft.projectId}
						onSelect={handleSelectProject}
						onBack={() => setActivePicker(null)}
					/>
				) : (
					<div className='px-5 py-5 flex flex-col gap-3.5'>
						{isEdit && draft.hasUnsupportedContent && (
							<div className='flex items-start gap-2 font-mono text-[11px] text-warning bg-warning/10 border border-warning/30 rounded-lg px-3 py-2'>
								<TbAlertTriangle className='text-sm shrink-0 mt-0.5' />
								<span>
									This note has images or formatting that can't be edited here —
									saving will remove them.
								</span>
							</div>
						)}

						<div className='flex gap-2'>
							<div className='flex-1 min-w-0'>
								<FieldLabel>Title</FieldLabel>
								<input
									ref={titleRef}
									value={draft.title}
									onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
									placeholder='Title'
									className={inputClass}
								/>
							</div>
							<div className='w-24 shrink-0'>
								<FieldLabel>Type</FieldLabel>
								<Listbox
									value={draft.type}
									onChange={(type) => setDraft((d) => ({ ...d, type }))}
									options={TYPE_OPTIONS}
									placeholder='Type'
								/>
							</div>
							<div className='shrink-0'>
								<FieldLabel>&nbsp;</FieldLabel>
								<button
									type='button'
									onClick={() => setDraft((d) => ({ ...d, pinned: !d.pinned }))}
									title={draft.pinned ? 'Unpin' : 'Pin'}
									className={`flex items-center justify-center w-[38px] h-[38px] rounded-lg border transition-colors ${focusRing} ${
										draft.pinned
											? 'bg-warning/15 border-warning/40 text-warning'
											: 'border-white/[0.08] text-white/40 hover:text-warning hover:border-warning/30'
									}`}
								>
									{draft.pinned ? (
										<TbPinFilled className='text-base' />
									) : (
										<TbPin className='text-base' />
									)}
								</button>
							</div>
							<div className='shrink-0'>
								<FieldLabel>&nbsp;</FieldLabel>
								<button
									type='button'
									onClick={() => setDraft((d) => ({ ...d, backBurner: !d.backBurner }))}
									title={draft.backBurner ? 'Remove from back burner' : 'Send to back burner'}
									className={`flex items-center justify-center w-[38px] h-[38px] rounded-lg border transition-colors ${focusRing} ${
										draft.backBurner
											? 'bg-teal/15 border-teal/40 text-teal'
											: 'border-white/[0.08] text-white/40 hover:text-teal hover:border-teal/30'
									}`}
								>
									{draft.backBurner ? (
										<TbHourglass className='text-base' />
									) : (
										<TbHourglassEmpty className='text-base' />
									)}
								</button>
							</div>
						</div>

						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Client</FieldLabel>
								<FieldButton
									label={draft.clientName || '— No client —'}
									filled={!!draft.clientId}
									onClick={() => setActivePicker('client')}
								/>
							</div>
							<div>
								<FieldLabel>Project</FieldLabel>
								<FieldButton
									ref={projectButtonRef}
									label={draft.projectName || '— No project —'}
									filled={!!draft.projectId}
									onClick={() => setActivePicker('project')}
									disabled={!draft.clientId}
								/>
							</div>
						</div>

						<div>
							<div className='flex items-center justify-between mb-1.5'>
								<FieldLabel>Description</FieldLabel>
								<div className='flex items-center gap-0.5'>
									<ToolbarButton onClick={handleBold} title='Bold'>
										<TbBold className='text-sm' />
									</ToolbarButton>
									<ToolbarButton onClick={handleItalic} title='Italic'>
										<TbItalic className='text-sm' />
									</ToolbarButton>
									<ToolbarButton onClick={handleBullet} title='Bullet list'>
										<TbList className='text-sm' />
									</ToolbarButton>
									<ToolbarButton onClick={handleNumbered} title='Numbered list'>
										<TbListNumbers className='text-sm' />
									</ToolbarButton>
								</div>
							</div>
							<textarea
								ref={textareaRef}
								value={draft.body}
								onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
								placeholder='Description (optional)'
								rows={expanded ? 14 : 6}
								className={`${inputClass} resize-none font-mono`}
							/>
						</div>

						{error && <p className='font-mono text-[11px] text-danger'>{error}</p>}

						<div className='flex justify-end gap-2 pt-1'>
							<button
								type='button'
								onClick={handleClose}
								className={`font-mono text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded ${focusRing}`}
							>
								Cancel
							</button>
							<button
								type='submit'
								disabled={!draft.title.trim() || saving}
								className={`font-mono text-xs bg-teal hover:bg-teal/25 disabled:bg-teal/0 disabled:cursor-not-allowed text-dark border border-teal/60 disabled:text-teal/75 rounded-lg px-4 py-1.5 transition-colors ${focusRing}`}
							>
								{saving
									? isEdit
										? 'Saving…'
										: 'Adding…'
									: isEdit
										? 'Save Changes'
										: 'Add Note'}
							</button>
						</div>
					</div>
				)}
			</form>
		</div>
	);
}