// components/notes/NoteForm.jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import {
	TbX,
	TbPin,
	TbPinFilled,
	TbChevronDown,
	TbChevronLeft,
	TbChevronRight,
	TbBold,
	TbItalic,
	TbList,
	TbListNumbers,
	TbArrowsMaximize,
	TbArrowsMinimize,
} from 'react-icons/tb';

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

// FETCH_CLIENTS_QUERY already returns one flat, unfiltered `projects`
// array per client — no status-bucket combining needed.
function getClientProjects(client) {
	return client?.projects || [];
}

// ─── Custom listbox — native <select> dropdowns are browser-chrome-rendered
// and can't be themed. This is a styled replacement with the same value/
// onChange contract, sized and colored to match the rest of the app. ───────

function Listbox({ value, onChange, options, placeholder, disabled }) {
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
				disabled={disabled}
				onClick={() => setOpen((o) => !o)}
				className={`w-full flex items-center justify-between bg-white/[0.04] border rounded-lg px-3 py-2 text-sm text-left transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed ${
					open ? 'border-teal/40' : 'border-white/[0.08]'
				}`}
			>
				<span className={`truncate ${selected?.value ? 'text-white' : 'text-white/30'}`}>
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
							key={o.value || '__none'}
							type='button'
							onClick={() => {
								onChange(o.value);
								setOpen(false);
							}}
							className={`w-full text-left px-3 py-2 text-sm font-mono transition-colors ${
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

function FieldLabel({ children }) {
	return (
		<span className='block font-mono text-[10px] tracking-widest uppercase text-white/40 mb-1.5'>
			{children}
		</span>
	);
}

const inputClass =
	'bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-teal/40 w-full';

function ToolbarButton({ onClick, title, children }) {
	return (
		<button
			type='button'
			onClick={onClick}
			title={title}
			className='flex items-center justify-center w-7 h-7 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors'
		>
			{children}
		</button>
	);
}

export default function NoteForm({
	open,
	onClose,
	onCreated,
	clients, // pass this to enable editable client/project selects (dashboard)
	clientId, // pass these (without `clients`) for fixed-context mode (project/client page)
	clientName,
	clientSlug,
	projectId,
	projectName,
	projectSlug,
}) {
	const editable = Array.isArray(clients);

	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [type, setType] = useState('general');
	const [pinned, setPinned] = useState(false);
	const [selectedClientId, setSelectedClientId] = useState(clientId || '');
	const [selectedProjectId, setSelectedProjectId] = useState(projectId || '');
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const [position, setPosition] = useState('right');
	const [expanded, setExpanded] = useState(false);

	const textareaRef = useRef(null);

	function cyclePosition(direction) {
		setPosition((prev) => {
			const idx = POSITIONS.indexOf(prev);
			return POSITIONS[(idx + direction + POSITIONS.length) % POSITIONS.length];
		});
	}

	// ─── Formatting toolbar — inserts markdown-lite syntax at the cursor/
	// selection, parsed into real Portable Text blocks server-side on submit.

	function applyWrap(marker) {
		const ta = textareaRef.current;
		if (!ta) return;
		const start = ta.selectionStart;
		const end = ta.selectionEnd;
		const selected = body.slice(start, end);
		const newText = body.slice(0, start) + marker + selected + marker + body.slice(end);
		setBody(newText);
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
		const lineStart = body.lastIndexOf('\n', start - 1) + 1;
		let lineEnd = body.indexOf('\n', end);
		if (lineEnd === -1) lineEnd = body.length;
		const block = body.slice(lineStart, lineEnd);
		const lines = block.split('\n');
		const prefixed = lines.map((line, i) => `${getPrefix(i)}${line}`).join('\n');
		const newText = body.slice(0, lineStart) + prefixed + body.slice(lineEnd);
		setBody(newText);
		requestAnimationFrame(() => {
			ta.focus();
			ta.setSelectionRange(lineStart, lineStart + prefixed.length);
		});
	}

	const handleBold = () => applyWrap('**');
	const handleItalic = () => applyWrap('*');
	const handleBullet = () => applyLinePrefix(() => '- ');
	const handleNumbered = () => applyLinePrefix((i) => `${i + 1}. `);

	const selectedClient = editable
		? clients.find((c) => c._id === selectedClientId) || null
		: null;
	const projectOptions = editable ? getClientProjects(selectedClient) : [];

	const clientListOptions = [
		{ value: '', label: '— No client —' },
		...(editable ? clients.map((c) => ({ value: c._id, label: c.name })) : []),
	];
	const projectListOptions = [
		{ value: '', label: '— No project —' },
		...projectOptions.map((p) => ({ value: p._id, label: p.name })),
	];

	const contextLabel = !editable
		? projectName
			? `${clientName} · ${projectName}`
			: clientName || null
		: null;

	function handleClientChange(newClientId) {
		setSelectedClientId(newClientId);
		setSelectedProjectId(''); // project belongs to a specific client
	}

	// Component stays mounted for the whole page session — closing only
	// hides it, so this never touches field state. Draft text survives
	// close/reopen, and only clears on a real page reload (fresh state).
	function handleClose() {
		onClose();
	}

	function resetFields() {
		setTitle('');
		setBody('');
		setType('general');
		setPinned(false);
		setSelectedClientId(clientId || '');
		setSelectedProjectId(projectId || '');
		setError(null);
		setExpanded(false);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!title.trim() || saving) return;

		setSaving(true);
		setError(null);

		const finalClientId = editable ? selectedClientId || null : clientId || null;
		const finalProjectId = editable ? selectedProjectId || null : projectId || null;

		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					body: body.trim(),
					type,
					pinned,
					clientId: finalClientId,
					projectId: finalProjectId,
				}),
			});

			if (!res.ok) throw new Error('Failed');

			const { note } = await res.json();

			const selectedProject = editable
				? projectOptions.find((p) => p._id === finalProjectId) || null
				: null;

			onCreated({
				...note,
				clientName: editable ? selectedClient?.name || null : clientName || null,
				clientSlug: editable ? selectedClient?.slug || null : clientSlug || null,
				projectName: editable ? selectedProject?.name || null : projectName || null,
				projectSlug: editable ? selectedProject?.slug || null : projectSlug || null,
			});

			resetFields();
			handleClose();
		} catch {
			setError('Could not save — try again.');
			setSaving(false);
		}
	}

	return (
		<div
			className={`fixed inset-0 z-[999999] flex items-end justify-center ${POSITION_JUSTIFY[position]} sm:p-6 bg-white/5 transition-opacity duration-300 ${
				open ? 'opacity-100' : 'opacity-0 pointer-events-none'
			}`}
			onClick={(e) => {
				if (e.target === e.currentTarget) handleClose();
			}}
		>
			<form
				onSubmit={handleSubmit}
				className={`w-full bg-[#12151c] border border-warning/30 rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-dark-mid/30 flex flex-col overflow-y-auto will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] transition-[max-width,max-height] motion-safe:duration-200 ease-out ${
					open ? 'translate-y-0' : 'translate-y-full'
				} ${
					expanded
						? 'sm:w-[36rem] 2xl:w-[48rem] max-h-[92vh]'
						: 'sm:w-[30rem] 2xl:w-[40rem] max-h-[85vh]'
				}`}
			>
				<div className='flex items-center justify-between px-5 py-3.5 border-b border-white/10 shrink-0'>
					<p className='font-mono text-[10px] tracking-widest uppercase text-white/40'>
						Add Note
					</p>
					<div className='flex items-center gap-1'>
						<button
							type='button'
							onClick={() => setExpanded((e) => !e)}
							title={expanded ? 'Collapse' : 'Expand'}
							className='hidden sm:inline-flex text-white/30 hover:text-white transition-colors p-1'
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
							className='hidden sm:inline-flex text-white/30 hover:text-white transition-colors p-1'
						>
							<TbChevronLeft className='text-base' />
						</button>
						<button
							type='button'
							onClick={() => cyclePosition(1)}
							title='Move right'
							className='hidden sm:inline-flex text-white/30 hover:text-white transition-colors p-1'
						>
							<TbChevronRight className='text-base' />
						</button>
						<button
							type='button'
							onClick={handleClose}
							className='text-white/30 hover:text-white transition-colors ml-1'
						>
							<TbX className='text-lg' />
						</button>
					</div>
				</div>

				<div className='px-5 py-5 flex flex-col gap-3.5'>
					{contextLabel && (
						<p className='font-mono text-[11px] text-white/40'>
							Adding note for: <span className='text-teal'>{contextLabel}</span>
						</p>
					)}

					{/* Title / Type / Pin — combined into one compact row */}
					<div className='flex gap-2'>
						<div className='flex-1 min-w-0'>
							<FieldLabel>Title</FieldLabel>
							<input
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder='Title'
								className={inputClass}
							/>
						</div>
						<div className='w-28 shrink-0'>
							<FieldLabel>Type</FieldLabel>
							<Listbox
								value={type}
								onChange={setType}
								options={TYPE_OPTIONS}
								placeholder='Type'
							/>
						</div>
						<div className='shrink-0'>
							<FieldLabel>&nbsp;</FieldLabel>
							<button
								type='button'
								onClick={() => setPinned(!pinned)}
								title={pinned ? 'Unpin' : 'Pin'}
								className={`flex items-center justify-center w-[38px] h-[38px] rounded-lg border transition-colors ${
									pinned
										? 'bg-warning/15 border-warning/40 text-warning'
										: 'border-white/[0.08] text-white/40 hover:text-warning hover:border-warning/30'
								}`}
							>
								{pinned ? (
									<TbPinFilled className='text-base' />
								) : (
									<TbPin className='text-base' />
								)}
							</button>
						</div>
					</div>

					{editable && (
						<div className='grid grid-cols-2 gap-3'>
							<div>
								<FieldLabel>Client</FieldLabel>
								<Listbox
									value={selectedClientId}
									onChange={handleClientChange}
									options={clientListOptions}
									placeholder='— No client —'
								/>
							</div>
							<div>
								<FieldLabel>Project</FieldLabel>
								<Listbox
									value={selectedProjectId}
									onChange={setSelectedProjectId}
									options={projectListOptions}
									placeholder='— No project —'
									disabled={!selectedClientId}
								/>
							</div>
						</div>
					)}

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
							value={body}
							onChange={(e) => setBody(e.target.value)}
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
							className='font-mono text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={!title.trim() || saving}
							className='font-mono text-xs bg-teal/15 hover:bg-teal/25 disabled:opacity-40 disabled:cursor-not-allowed text-teal border border-teal/30 rounded-lg px-4 py-1.5 transition-colors'
						>
							{saving ? 'Adding…' : 'Add Note'}
						</button>
					</div>
				</div>
			</form>
		</div>
	);
}