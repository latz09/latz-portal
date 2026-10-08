'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
	TbLayoutDashboard,
	TbFileText,
	TbPencil,
	TbLayout,
	TbBook,
	TbCopy,
	TbCheck,
	TbBrandNotion,
	TbBrandGoogleDrive,
	TbBrandPinterest,
	TbVideo,
	TbLink,
	TbBrandFigma,
	TbWorld,
	TbPlus,
	TbExternalLink,
	TbGripVertical,
	TbArrowsSort,
} from 'react-icons/tb';
import {
	DndContext,
	closestCenter,
	PointerSensor,
	KeyboardSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	verticalListSortingStrategy,
	useSortable,
	arrayMove,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import MoodBoard from './MoodBoard';
import DocForm from './DocForm';
import ResourceForm from './ResourceForm';
import DocPreviewPanel from './DocPreviewPanel';

const variantStyles = {
	internal: { icon: 'text-teal' },
	designer: { icon: 'text-purple' },
	client: { icon: 'text-teal' },
};

const audienceBadge = {
	internal: 'text-teal',
	designer: 'text-purple',
	client: 'text-warning',
};

const docIcon = {
	'overview.html': TbLayoutDashboard,
	'proposal.html': TbFileText,
	'designBrief.html': TbPencil,
	'wireframe.html': TbLayout,
	'cms-guide.html': TbBook,
};

const resourceIcon = {
	'google-drive': TbBrandGoogleDrive,
	figma: TbBrandFigma,
	notion: TbBrandNotion,
	video: TbVideo,
	pinterest: TbBrandPinterest,
	link: TbWorld,
	other: TbLink,
};

const UNCATEGORIZED = 'uncategorized';

const CATEGORY_GROUPS = [
	{ label: 'Outreach', match: ['outreach'] },
	{ label: 'Proposal & Close', match: ['proposal-close'] },
	{ label: 'Kickoff', match: ['kickoff'] },
	{ label: 'Design', match: ['design'] },
	{ label: 'Build', match: ['build'] },
	{ label: 'Technical', match: ['technical'] },
	{ label: 'Handoff', match: ['handoff'] },
	{ label: 'Other', match: ['other', UNCATEGORIZED] },
];

export const FULL_GROUPS = CATEGORY_GROUPS;
export const DESIGNER_GROUPS = CATEGORY_GROUPS;

// Splices a group's newly-reordered doc keys back into the full project
// docs array, preserving every other doc's absolute position. The group's
// own slots (wherever its docs currently sit in the full array) get
// refilled in the new order; everything else is untouched.
function mergeGroupOrder(fullDocs, groupKeyOrder) {
	const groupKeySet = new Set(groupKeyOrder);
	let cursor = 0;
	return fullDocs.map((doc) => {
		if (!groupKeySet.has(doc._key)) return doc;
		const nextKey = groupKeyOrder[cursor];
		cursor += 1;
		return fullDocs.find((d) => d._key === nextKey);
	});
}

function SortableDocRow({ item, iconColorClass }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item.key });
	const Icon = item.icon;

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
	};

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-3 px-4 py-3 bg-[#0d0f14] ${isDragging ? 'opacity-50' : ''}`}
		>
			<button
				type='button'
				{...attributes}
				{...listeners}
				className='p-1 -ml-1 text-white/20 hover:text-white/50 cursor-grab active:cursor-grabbing shrink-0 touch-none'
				aria-label='Drag to reorder'
			>
				<TbGripVertical className='text-lg' />
			</button>
			<Icon className={`text-lg ${iconColorClass} shrink-0 opacity-80`} />
			<span className='font-medium text-sm text-white truncate'>
				{item.label}
			</span>
		</div>
	);
}

export default function ProjectAssets({
	variant,
	docs,
	resources,
	inspiration,
	clientSlug,
	projectSlug,
	projectId,
	groups = FULL_GROUPS,
}) {
	const router = useRouter();
	const s = variantStyles[variant];
	const [copiedKey, setCopiedKey] = useState(null);

	const [docsState, setDocsState] = useState(docs || []);
	const [addDocOpen, setAddDocOpen] = useState(false);
	const [editingDoc, setEditingDoc] = useState(null);

	const [resourcesState, setResourcesState] = useState(resources || []);
	const [addResourceOpen, setAddResourceOpen] = useState(false);
	const [editingResource, setEditingResource] = useState(null);

	const [previewDoc, setPreviewDoc] = useState(null);
	const [panelExpanded, setPanelExpanded] = useState(false);

	const [reorderMode, setReorderMode] = useState(false);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	useEffect(() => {
		setDocsState(docs || []);
	}, [docs]);

	useEffect(() => {
		setResourcesState(resources || []);
	}, [resources]);

	const handleCopy = (e, filename) => {
		e.preventDefault();
		e.stopPropagation();
		const url = `${window.location.origin}/clients/${clientSlug}/${projectSlug}/${filename}`;
		navigator.clipboard.writeText(url);
		setCopiedKey(filename);
		setTimeout(() => setCopiedKey((k) => (k === filename ? null : k)), 5000);
	};

	// Preview panel

	const closePreview = () => setPreviewDoc(null);
	const toggleExpand = () => setPanelExpanded((v) => !v);

	const handleRowClick = (e, item, canPreview) => {
		if (!canPreview) return;
		if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
		e.preventDefault();
		setPreviewDoc(item);
	};

	const handleOpenFullPage = (e, item) => {
		e.preventDefault();
		e.stopPropagation();
		router.push(item.href);
	};

	// Reorder

	const toggleReorderMode = () => {
		setReorderMode((v) => !v);
		closePreview();
	};

	const handleDragEnd = async (event, docsInGroup) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const groupKeys = docsInGroup.map((d) => d.key);
		const oldIndex = groupKeys.indexOf(active.id);
		const newIndex = groupKeys.indexOf(over.id);
		const newGroupOrder = arrayMove(groupKeys, oldIndex, newIndex);

		const prevDocsState = docsState;
		const reordered = mergeGroupOrder(docsState, newGroupOrder);
		setDocsState(reordered);

		const res = await fetch(`/api/projects/${projectId}/docs/reorder`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ orderedKeys: reordered.map((d) => d._key) }),
		});

		if (!res.ok) {
			setDocsState(prevDocsState);
			return;
		}
		router.refresh();
	};

	// Docs

	const handleDocEditClick = (e, item) => {
		e.preventDefault();
		e.stopPropagation();
		setEditingDoc({
			_key: item.key,
			label: item.label,
			filename: item.filename,
			category: item.category === UNCATEGORIZED ? 'other' : item.category,
			audience: item.audience || [],
		});
	};

	const closeDocForm = () => {
		setAddDocOpen(false);
		setEditingDoc(null);
	};

	const handleAddDoc = async (doc) => {
		const res = await fetch(`/api/projects/${projectId}/docs`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(doc),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to add document');
		}
		const { doc: savedDoc } = await res.json();
		setDocsState((d) => [...d, savedDoc]);
		closeDocForm();
		router.refresh();
	};

	const handleEditDoc = async (payload) => {
		const res = await fetch(`/api/projects/${projectId}/docs`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to update document');
		}
		const { doc: savedDoc } = await res.json();
		setDocsState((d) =>
			d.map((doc) => (doc._key === savedDoc._key ? savedDoc : doc)),
		);
		closeDocForm();
		router.refresh();
	};

	const handleDeleteDoc = async (key) => {
		const res = await fetch(`/api/projects/${projectId}/docs`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to delete document');
		}
		setDocsState((d) => d.filter((doc) => doc._key !== key));
		closeDocForm();
		router.refresh();
	};

	// Resources

	const handleResourceEditClick = (e, item) => {
		e.preventDefault();
		e.stopPropagation();
		setEditingResource({
			_key: item.key,
			label: item.label,
			url: item.href,
			type: item.type,
			category: item.category === UNCATEGORIZED ? 'other' : item.category,
			audience: item.audience || [],
		});
	};

	const closeResourceForm = () => {
		setAddResourceOpen(false);
		setEditingResource(null);
	};

	const handleAddResource = async (resource) => {
		const res = await fetch(`/api/projects/${projectId}/resources`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(resource),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to add resource');
		}
		const { resource: saved } = await res.json();
		setResourcesState((r) => [...r, saved]);
		closeResourceForm();
		router.refresh();
	};

	const handleEditResource = async (payload) => {
		const res = await fetch(`/api/projects/${projectId}/resources`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to update resource');
		}
		const { resource: saved } = await res.json();
		setResourcesState((r) =>
			r.map((item) => (item._key === saved._key ? saved : item)),
		);
		closeResourceForm();
		router.refresh();
	};

	const handleDeleteResource = async (key) => {
		const res = await fetch(`/api/projects/${projectId}/resources`, {
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key }),
		});
		if (!res.ok) {
			const body = await res.json().catch(() => ({}));
			throw new Error(body.error || 'Failed to delete resource');
		}
		setResourcesState((r) => r.filter((item) => item._key !== key));
		closeResourceForm();
		router.refresh();
	};

	const docItems = (docsState || []).map((doc, i) => ({
		key: doc._key || `doc-${i}`,
		kind: 'doc',
		label: doc.label,
		category: doc.category || UNCATEGORIZED,
		audience: doc.audience,
		icon: docIcon[doc.filename] ?? TbFileText,
		href: `/view/${clientSlug}/${projectSlug}/${doc.filename}?ref=${variant}`,
		filename: doc.filename,
	}));

	const resourceItems = (resourcesState || []).map((res, i) => ({
		key: res._key || `resource-${i}`,
		kind: 'resource',
		label: res.label,
		category: res.category || UNCATEGORIZED,
		audience: res.audience,
		icon: resourceIcon[res.type] ?? TbLink,
		href: res.url,
		type: res.type,
	}));

	const allItems = [...docItems, ...resourceItems];

	if (allItems.length === 0 && !inspiration?.length && variant !== 'internal')
		return null;

	const renderRow = (item) => {
		const Icon = item.icon;
		const isDoc = item.kind === 'doc';
		const isCopied = copiedKey === item.filename;
		const canPreview =
			isDoc && (variant === 'internal' || variant === 'designer');
		const isSelected = previewDoc?.key === item.key;
		const showActions =
			variant === 'internal' || (variant === 'designer' && isDoc);
		return (
			<a
				key={item.key}
				href={item.href}
				target={isDoc ? undefined : '_blank'}
				rel={isDoc ? undefined : 'noopener noreferrer'}
				onClick={(e) => handleRowClick(e, item, canPreview)}
				className={`group flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/[0.05] transition-colors ${
					isSelected ? 'bg-white/[0.06]' : ''
				}`}
			>
				<div className='flex items-center gap-3 min-w-0'>
					<Icon
						className={`text-lg ${s.icon} shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
					/>
					<span className='font-medium text-sm text-white truncate'>
						{item.label}
					</span>
					{!isDoc && (
						<TbExternalLink className='text-white/25 text-xs shrink-0' />
					)}
					{variant === 'internal' && item.audience?.length > 0 && (
						<div className='hidden sm:flex items-center gap-1.5 shrink-0'>
							{item.audience.map((a) => (
								<span
									key={a}
									className={`font-mono text-[10px] uppercase tracking-wide ${audienceBadge[a]}`}
								>
									{a}
								</span>
							))}
						</div>
					)}
				</div>
				{showActions && (
					<div className='flex items-center gap-1 shrink-0'>
						{variant === 'internal' && (
							<button
								type='button'
								onClick={(e) =>
									isDoc
										? handleDocEditClick(e, item)
										: handleResourceEditClick(e, item)
								}
								title={isDoc ? 'Edit document' : 'Edit resource'}
								className='p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all opacity-60 lg:opacity-0 lg:group-hover:opacity-100'
							>
								<TbPencil className='text-base' />
							</button>
						)}
						{variant === 'internal' && isDoc && (
							<button
								type='button'
								onClick={(e) => handleCopy(e, item.filename)}
								title='Copy static file link'
								className={`p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all ${
									isCopied ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
								}`}
							>
								{isCopied ? (
									<TbCheck className='text-base text-warning' />
								) : (
									<TbCopy className='text-base' />
								)}
							</button>
						)}
						{canPreview && (
							<button
								type='button'
								onClick={(e) => handleOpenFullPage(e, item)}
								title='Open full page'
								className='p-1.5 rounded-lg text-white/30 hover:text-teal hover:bg-white/[0.06] transition-all opacity-60 lg:opacity-0 lg:group-hover:opacity-100'
							>
								<TbExternalLink className='text-base' />
							</button>
						)}
					</div>
				)}
			</a>
		);
	};

	const totalDocCount = docItems.length;

	return (
		<div className='mb-16'>
			{variant === 'internal' && totalDocCount > 1 && (
				<div className='flex justify-end mb-3'>
					<button
						type='button'
						onClick={toggleReorderMode}
						className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-3 py-1.5 rounded-full border transition-colors ${
							reorderMode
								? 'bg-teal/80 border-teal/30 text-white'
								: 'border-white/[0.08] text-white/40 hover:text-white hover:bg-white/[0.06]'
						}`}
					>
						<TbArrowsSort className='text-sm' />
						{reorderMode ? 'Done Reordering' : 'Reorder Documents'}
					</button>
				</div>
			)}

{groups.map(group => {
  const groupItems = allItems.filter(item => group.match.includes(item.category))
  if (groupItems.length === 0) return null
  const docsInGroup = groupItems.filter((i) => i.kind === 'doc')
  const resourcesInGroup = groupItems.filter((i) => i.kind === 'resource')

  return (
    <div key={group.label} className='mb-6'>
      <p className='font-mono text-[10px] lg:text-xs text-white/40 tracking-widest uppercase mb-3'>
        {group.label}
      </p>
      <div className='bg-white/[0.03] border border-white/[0.08] rounded-xl overflow-hidden'>
        {resourcesInGroup.length > 0 && (
          <div className={`p-2.5 ${docsInGroup.length > 0 ? 'border-b border-white/[0.08]' : ''}`}>
            <p className='font-mono text-[9px] tracking-widest uppercase text-white/30 px-1.5 pb-1.5'>
              Resources
            </p>
            <div className='divide-y divide-white/[0.06] bg-dark/70 border border-white/[0.06] rounded-lg overflow-hidden'>
              {resourcesInGroup.map((item) => renderRow(item))}
            </div>
          </div>
        )}
        {docsInGroup.length > 0 && (
          reorderMode && variant === 'internal' ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={(e) => handleDragEnd(e, docsInGroup)}
            >
              <SortableContext
                items={docsInGroup.map((d) => d.key)}
                strategy={verticalListSortingStrategy}
              >
                <div className='divide-y divide-white/[0.06]'>
                  {docsInGroup.map((item) => (
                    <SortableDocRow key={item.key} item={item} iconColorClass={s.icon} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className='divide-y divide-white/[0.06]'>
              {docsInGroup.map((item) => renderRow(item))}
            </div>
          )
        )}
      </div>
    </div>
  )
})}



			{variant === 'internal' && !reorderMode && (
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6'>
					<button
						type='button'
						onClick={() => setAddDocOpen(true)}
						className='flex items-center justify-center gap-2 border border-dashed border-white/[0.12] rounded-xl py-3 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors'
					>
						<TbPlus className='text-lg' />
						<span className='text-sm font-medium'>Add Document</span>
					</button>
					<button
						type='button'
						onClick={() => setAddResourceOpen(true)}
						className='flex items-center justify-center gap-2 border border-dashed border-white/[0.12] rounded-xl py-3 text-white/30 hover:text-white/60 hover:border-white/25 transition-colors'
					>
						<TbPlus className='text-lg' />
						<span className='text-sm font-medium'>Add Resource</span>
					</button>
				</div>
			)}

			{inspiration?.length > 0 && (
				<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
					<MoodBoard inspiration={inspiration} variant={variant} />
				</div>
			)}

			{(addDocOpen || editingDoc) && (
				<DocForm
					initialDoc={editingDoc}
					onClose={closeDocForm}
					onSave={editingDoc ? handleEditDoc : handleAddDoc}
					onDelete={editingDoc ? handleDeleteDoc : undefined}
				/>
			)}

			{(addResourceOpen || editingResource) && (
				<ResourceForm
					initialResource={editingResource}
					onClose={closeResourceForm}
					onSave={editingResource ? handleEditResource : handleAddResource}
					onDelete={editingResource ? handleDeleteResource : undefined}
				/>
			)}

			<DocPreviewPanel
				doc={previewDoc}
				clientSlug={clientSlug}
				projectSlug={projectSlug}
				expanded={panelExpanded}
				onExpandToggle={toggleExpand}
				onClose={closePreview}
			/>
		</div>
	);
}
