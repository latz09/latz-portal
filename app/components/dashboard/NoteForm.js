'use client';

import { useState, useEffect, useRef } from 'react';
import { TbX } from 'react-icons/tb';

const TYPES = ['general', 'idea', 'task', 'link', 'asset'];

const typeColors = {
	general: 'border-white/20 text-white/50',
	idea: 'border-purple text-purple',
	task: 'border-teal text-teal',
	link: 'border-warning text-warning',
	asset: 'border-white/20 text-white/50',
};

export default function NoteForm({ onClose, onCreated, defaultClientId }) {
	const [title, setTitle] = useState('');
	const [body, setBody] = useState('');
	const [type, setType] = useState('general');
	const [clientId, setClientId] = useState(defaultClientId ?? '');
	const [clients, setClients] = useState([]);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);
	const titleRef = useRef(null);

	// Focus title on open
	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	// Fetch clients for the dropdown (reuses existing API)
	useEffect(() => {
		fetch('/api/clients')
			.then((r) => r.json())
			.then(setClients)
			.catch(() => {});
	}, []);

	// Escape to close
	useEffect(() => {
		const handler = (e) => {
			if (e.key === 'Escape') onClose();
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	async function handleSubmit(e) {
		e.preventDefault();
		if (!title.trim()) return;

		setSaving(true);
		setError(null);

		try {
			const res = await fetch('/api/notes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ title, body, type, clientId: clientId || null }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || 'Failed to save');
			}

			const created = await res.json();
			onCreated?.(created);
			onClose();
		} catch (err) {
			setError(err.message);
			setSaving(false);
		}
	}

	return (
		// Backdrop
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4'
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className='w-full max-w-lg bg-dark border border-white/10 rounded-lg shadow-2xl flex flex-col'>
				{/* Header */}
				<div className='flex items-center justify-between px-5 py-4 border-b border-white/10'>
					<p className='font-mono text-xs tracking-widest uppercase text-warning/80'>
						New Note
					</p>
					<button
						onClick={onClose}
						className='text-white/30 hover:text-white transition-colors'
					>
						<TbX className='text-lg' />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='flex flex-col gap-4 p-5'>
					{/* Title */}
					<input
						ref={titleRef}
						type='text'
						placeholder='Title'
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						className='w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors'
					/>

					{/* Type pills */}
					<div className='flex gap-2 flex-wrap'>
						{TYPES.map((t) => (
							<button
								key={t}
								type='button'
								onClick={() => setType(t)}
								className={`font-mono text-[10px] tracking-widest uppercase border rounded px-2 py-0.5 transition-colors ${
									type === t
										? typeColors[t]
										: 'border-white/10 text-white/20 hover:border-white/20 hover:text-white/40'
								}`}
							>
								{t}
							</button>
						))}
					</div>

					{/* Body */}
					<textarea
						placeholder='Body (optional)'
						value={body}
						onChange={(e) => setBody(e.target.value)}
						rows={5}
						className='w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition-colors resize-none'
					/>

					{/* Client dropdown */}
					<select
						value={clientId}
						onChange={(e) => setClientId(e.target.value)}
						className='w-full bg-dark border border-white/10 rounded px-3 py-2 text-sm text-white/60 outline-none focus:border-white/30 transition-colors'
					>
						<option value=''>No client</option>
						{clients.map((c) => (
							<option key={c._id} value={c._id}>
								{c.name}
							</option>
						))}
					</select>

					{error && <p className='font-mono text-xs text-danger'>{error}</p>}

					{/* Actions */}
					<div className='flex justify-end gap-2 pt-1'>
						<button
							type='button'
							onClick={onClose}
							className='font-mono text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5'
						>
							Cancel
						</button>
						<button
							type='submit'
							disabled={!title.trim() || saving}
							className='font-mono text-xs bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed text-white border border-white/10 rounded px-4 py-1.5 transition-colors'
						>
							{saving ? 'Saving…' : 'Save Note'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
