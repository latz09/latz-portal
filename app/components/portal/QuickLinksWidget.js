'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
	TbBookmark,
	TbX,
	TbPlus,
	TbPencil,
	TbLink,
	TbTrash,
} from 'react-icons/tb';

function normalizeUrl(value) {
	const trimmed = value.trim();
	if (!trimmed) return trimmed;
	return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function faviconFor(url) {
	try {
		const { hostname } = new URL(url);
		return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
	} catch {
		return null;
	}
}

function LinkIcon({ url }) {
	const [failed, setFailed] = useState(false);
	const src = faviconFor(url);
	if (!src || failed) {
		return <TbLink className='text-white/40 text-lg shrink-0' />;
	}
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={src}
			alt=''
			width={18}
			height={18}
			className='shrink-0 rounded-sm'
			onError={() => setFailed(true)}
		/>
	);
}

function LinkForm({ initial, onCancel, onSave }) {
	const [label, setLabel] = useState(initial?.label || '');
	const [url, setUrl] = useState(initial?.url || '');
	const [error, setError] = useState('');
	const [saving, setSaving] = useState(false);

	async function submit(e) {
		e.preventDefault();
		if (!label.trim() || !url.trim()) {
			setError('Both fields are required');
			return;
		}
		setSaving(true);
		setError('');
		try {
			await onSave({ label: label.trim(), url: normalizeUrl(url) });
		} catch (err) {
			setError(err.message || 'Failed to save');
			setSaving(false);
		}
	}

	return (
		<form
			onSubmit={submit}
			className='flex flex-col gap-2 px-4 py-3 bg-white/[0.04]'
		>
			<input
				type='text'
				placeholder='Label (e.g. Gmail)'
				value={label}
				onChange={(e) => setLabel(e.target.value)}
				className='bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-teal/50'
			/>
			<input
				type='text'
				placeholder='URL'
				value={url}
				onChange={(e) => setUrl(e.target.value)}
				className='bg-dark border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-teal/50'
			/>
			{error && <p className='text-xs text-danger'>{error}</p>}
			<div className='flex items-center gap-2 justify-end pt-1'>
				<button
					type='button'
					onClick={onCancel}
					className='font-mono text-xs px-3 py-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors'
				>
					Cancel
				</button>
				<button
					type='submit'
					disabled={saving}
					className='font-mono text-xs px-3 py-1.5 rounded-full bg-teal/80 text-white hover:bg-teal transition-colors disabled:opacity-50'
				>
					{saving ? 'Saving...' : 'Save'}
				</button>
			</div>
		</form>
	);
}

export default function QuickLinksWidget({ settingsLinks }) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [editMode, setEditMode] = useState(false);
	const [links, setLinks] = useState(settingsLinks || []);
	const [addingNew, setAddingNew] = useState(false);
	const [editingKey, setEditingKey] = useState(null);
	const [confirmDeleteKey, setConfirmDeleteKey] = useState(null);

	function close() {
		setOpen(false);
		setEditMode(false);
		setAddingNew(false);
		setEditingKey(null);
		setConfirmDeleteKey(null);
	}

	async function handleAdd(payload) {
		const res = await fetch('/api/settings/quick-links', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to add link');
		}
		const { link } = await res.json();
		setLinks((l) => [...l, link]);
		setAddingNew(false);
		router.refresh();
	}

	async function handleEdit(key, payload) {
		const res = await fetch('/api/settings/quick-links', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, ...payload }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to update link');
		}
		const { link } = await res.json();
		setLinks((l) => l.map((item) => (item._key === key ? link : item)));
		setEditingKey(null);
		router.refresh();
	}

	async function handleDelete(key) {
		const prev = links;
		setLinks((l) => l.filter((item) => item._key !== key));
		setConfirmDeleteKey(null);
		const res = await fetch('/api/settings/quick-links', {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key }),
		});
		if (!res.ok) {
			setLinks(prev);
			return;
		}
		router.refresh();
	}

	return (
		<div className='relative'>
			{open && (
				<div className='fixed inset-0 z-[90]' onClick={close} />
			)}

			<button
				type='button'
				onClick={() => setOpen((v) => !v)}
				aria-label='Quick links'
				className='flex items-center justify-center w-7 h-7 lg:w-8 lg:h-8 rounded-full text-white/40 hover:text-teal hover:bg-white/[0.06] transition-colors'
			>
				{open ? <TbX className='text-base' /> : <TbBookmark className='text-base' />}
			</button>

			{open && (
				<div className='absolute top-full left-0 mt-2 w-[calc(100vw-1.5rem)] sm:w-80 max-h-[70vh] flex flex-col rounded-2xl border border-white/10 bg-[#0d0f14] shadow-2xl overflow-hidden z-[100]'>
					<div className='flex items-center justify-between gap-3 px-4 py-3 border-b border-white/10 shrink-0'>
						<span className='font-mono text-xs tracking-widest uppercase text-white/40'>
							Quick Links
						</span>
						<button
							type='button'
							onClick={() => setEditMode((v) => !v)}
							className={`font-mono text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
								editMode
									? 'bg-teal/80 border-teal/30 text-white'
									: 'border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.06]'
							}`}
						>
							{editMode ? 'Done' : 'Edit'}
						</button>
					</div>

					<div className='flex-1 overflow-y-auto divide-y divide-white/[0.06]'>
						{links.length === 0 && !addingNew && (
							<p className='font-mono text-xs text-white/20 px-4 py-6 text-center'>
								No links yet
							</p>
						)}
						{links.map((item) =>
							editingKey === item._key ? (
								<LinkForm
									key={item._key}
									initial={item}
									onCancel={() => setEditingKey(null)}
									onSave={(payload) => handleEdit(item._key, payload)}
								/>
							) : (
								<div
									key={item._key}
									className='group flex items-center justify-between gap-2 px-4 py-2.5 hover:bg-white/[0.04] transition-colors'
								>
									{editMode ? (
										<>
											<div className='flex items-center gap-2.5 min-w-0'>
												<LinkIcon url={item.url} />
												<span className='text-sm text-white truncate'>
													{item.label}
												</span>
											</div>
											{confirmDeleteKey === item._key ? (
												<div className='flex items-center gap-1.5 shrink-0'>
													<button
														type='button'
														onClick={() => setConfirmDeleteKey(null)}
														className='font-mono text-[11px] text-white/40 hover:text-white'
													>
														Cancel
													</button>
													<button
														type='button'
														onClick={() => handleDelete(item._key)}
														className='font-mono text-[11px] text-danger hover:text-danger/80'
													>
														Confirm
													</button>
												</div>
											) : (
												<div className='flex items-center gap-1 shrink-0'>
													<button
														type='button'
														onClick={() => setEditingKey(item._key)}
														title='Edit'
														className='p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-colors'
													>
														<TbPencil className='text-sm' />
													</button>
													<button
														type='button'
														onClick={() => setConfirmDeleteKey(item._key)}
														title='Delete'
														className='p-1.5 rounded-lg text-white/30 hover:text-danger hover:bg-white/[0.06] transition-colors'
													>
														<TbTrash className='text-sm' />
													</button>
												</div>
											)}
										</>
									) : (
										<a
											href={item.url}
											target='_blank'
											rel='noopener noreferrer'
											className='flex items-center gap-2.5 min-w-0 flex-1'
										>
											<LinkIcon url={item.url} />
											<span className='text-sm text-white truncate'>
												{item.label}
											</span>
										</a>
									)}
								</div>
							),
						)}

						{addingNew && (
							<LinkForm
								onCancel={() => setAddingNew(false)}
								onSave={handleAdd}
							/>
						)}
					</div>

					{editMode && !addingNew && (
						<button
							type='button'
							onClick={() => setAddingNew(true)}
							className='flex items-center justify-center gap-2 px-4 py-3 border-t border-white/10 text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors shrink-0'
						>
							<TbPlus className='text-sm' />
							<span className='font-mono text-xs'>Add Link</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
}