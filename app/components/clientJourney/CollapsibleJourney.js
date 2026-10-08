'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
	TbChevronDown, TbCheck, TbPlus, TbArrowsSort,
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
	arrayMove,
	sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { PHASE_LABELS } from '@/app/utils/journeyHelpers';
import JourneyRow from './JourneyRow';
import AddStepInlineRow from './AddStepInlineRow';
import SortableJourneyRow from './SortableJourneyRow';

function PhaseNode({ allDone, isCurrent, empty }) {
	if (allDone) {
		return (
			<div className='w-3 h-3 lg:w-7 lg:h-7 rounded-full bg-teal flex items-center justify-center shrink-0 relative z-10'>
				<TbCheck className='text-black text-xs lg:text-sm' />
			</div>
		);
	}
	if (isCurrent) {
		return (
			<div className='w-3 h-3 lg:w-7 lg:h-7 rounded-full border-2 border-teal bg-dark flex items-center justify-center shrink-0 relative z-10'>
				<div className='w-1.5 h-1.5 rounded-full bg-teal animate-pulse' />
			</div>
		);
	}
	return (
		<div
			className={`w-3 h-3 lg:w-7 lg:h-7 rounded-full border-2 bg-dark flex items-center justify-center shrink-0 relative z-10 ${
				empty ? 'border-white/[0.06]' : 'border-white/15'
			}`}
		>
			<div className={`w-1 h-1 lg:w-1.5 lg:h-1.5 rounded-full ${empty ? 'bg-white/10' : 'bg-white/20'}`} />
		</div>
	);
}

export default function CollapsibleJourney({ phases, clientPayment, projectId }) {
	const router = useRouter();
	const [open, setOpen] = useState(() =>
		Object.fromEntries(phases.map((p) => [p.phase, p.defaultOpen])),
	);
	const [adding, setAdding] = useState({});
	const [reordering, setReordering] = useState({}); // { [phase]: boolean }
	const [localOrder, setLocalOrder] = useState({}); // { [phase]: string[] of step _keys }
	const lastCurrentPhase = useRef(
		phases.find((p) => p.isCurrent)?.phase ?? null,
	);

	const sensors = useSensors(
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	);

	useEffect(() => {
		const nowCurrent = phases.find((p) => p.isCurrent)?.phase ?? null;
		if (nowCurrent && nowCurrent !== lastCurrentPhase.current) {
			setOpen((s) => ({ ...s, [nowCurrent]: true }));
			lastCurrentPhase.current = nowCurrent;
		}
	}, [phases]);

	const populated = phases.filter((p) => p.total > 0);
	const allExpanded = populated.length > 0 && populated.every((p) => open[p.phase]);
	const toggle = (phase) => setOpen((s) => ({ ...s, [phase]: !s[phase] }));
	const setAll = (val) =>
		setOpen((s) => ({ ...s, ...Object.fromEntries(populated.map((p) => [p.phase, val])) }));
	const toggleAdding = (phase) => setAdding((s) => ({ ...s, [phase]: !s[phase] }));
	const stopAdding = (phase) => setAdding((s) => ({ ...s, [phase]: false }));
	const toggleReordering = (phase) => setReordering((s) => ({ ...s, [phase]: !s[phase] }));

	// A phase's items in display order: the local optimistic override if one
	// exists and still matches the current step-key set, otherwise server
	// order.
	function orderedItems(p) {
		const override = localOrder[p.phase];
		if (!override) return p.items;
		const byKey = new Map(p.items.map((it) => [it.step._key, it]));
		const sameSet =
			override.length === p.items.length && override.every((k) => byKey.has(k));
		if (!sameSet) return p.items;
		return override.map((k) => byKey.get(k));
	}

	async function handleDragEnd(event, phase, items) {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const keys = items.map((it) => it.step._key);
		const oldIndex = keys.indexOf(active.id);
		const newIndex = keys.indexOf(over.id);
		const newOrder = arrayMove(keys, oldIndex, newIndex);

		const prevOverride = localOrder[phase];
		setLocalOrder((s) => ({ ...s, [phase]: newOrder }));

		const res = await fetch(`/api/projects/${projectId}/journey/reorder`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ phase, orderedKeys: newOrder }),
		});

		if (!res.ok) {
			setLocalOrder((s) => ({ ...s, [phase]: prevOverride }));
			return;
		}
		router.refresh();
	}

	return (
		<div>
			{populated.length > 0 && (
				<div className='flex justify-end mb-4'>
					<button
						onClick={() => setAll(!allExpanded)}
						className='font-mono text-xs lg:text-sm tracking-widest uppercase text-white/40 hover:text-teal transition-colors'
					>
						{allExpanded ? 'Collapse all' : 'Expand all'}
					</button>
				</div>
			)}

			<div className='relative'>
				{phases.map((p, i) => {
					const isEmpty = p.total === 0;
					const isReordering = !!reordering[p.phase];
					const isOpen = isEmpty ? !!adding[p.phase] : isReordering ? true : !!open[p.phase];
					const isLast = i === phases.length - 1;
					const pct = p.total ? (p.doneCount / p.total) * 100 : 0;
					const items = isEmpty ? [] : orderedItems(p);

					return (
						<div
							key={p.phase}
							className='relative grid grid-cols-[20px_1fr] lg:grid-cols-[28px_1fr] gap-2 lg:gap-4'
						>
							<div className='relative flex flex-col items-center'>
								<PhaseNode allDone={p.allDone} isCurrent={p.isCurrent} empty={isEmpty} />
								{!isLast && (
									<div
										className={`w-0.5 flex-1 -mt-1 ${
											p.allDone ? 'bg-teal/40' : 'bg-white/10'
										}`}
									/>
								)}
							</div>

							<div className={isLast ? 'pb-2' : 'pb-8'}>
								{isEmpty ? (
									<button
										onClick={() => toggleAdding(p.phase)}
										className='flex items-center gap-2 lg:gap-3 w-full group text-left pt-0.5'
									>
										<span className='font-mono text-[11px] lg:text-xs tracking-widest uppercase text-white/20 shrink-0'>
											{PHASE_LABELS[p.phase] || p.phase}
										</span>
										<span className='flex items-center gap-1 font-mono text-[11px] text-white/20 group-hover:text-teal transition-colors'>
											<TbPlus size={11} /> Add step
										</span>
									</button>
								) : (
									<button
										onClick={() => !isReordering && toggle(p.phase)}
										disabled={isReordering}
										className='flex items-center gap-2 lg:gap-3 w-full group text-left pt-0.5 disabled:cursor-default'
									>
										<span
											className={`font-mono text-[11px] lg:text-xs tracking-widest uppercase shrink-0 ${
												p.isCurrent
													? 'text-teal'
													: p.allDone
														? 'text-white/40'
														: 'text-white/30'
											}`}
										>
											{PHASE_LABELS[p.phase] || p.phase}
										</span>

										<span className='flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden min-w-6 lg:min-w-8 max-w-20 lg:max-w-48'>
											<span
												className='block h-full bg-teal/70 rounded-full'
												style={{ width: `${pct}%` }}
											/>
										</span>

										<span className='font-mono text-[11px] lg:text-xs text-white/30 tabular-nums shrink-0'>
											{p.doneCount}/{p.total}
										</span>
										{!isReordering && (
											<TbChevronDown
												className={`text-white/25 group-hover:text-white/60 transition-all shrink-0 text-sm lg:text-base ${
													isOpen ? 'rotate-180' : ''
												}`}
											/>
										)}
									</button>
								)}

								{isOpen && (
									<div
										className={`mt-3 bg-dark border border-white/[0.08] rounded-xl ${
											p.isCurrent ? 'border-l-2 border-l-teal/40' : ''
										}`}
									>
										{isEmpty ? (
											<AddStepInlineRow
												phase={p.phase}
												projectId={projectId}
												onDone={() => stopAdding(p.phase)}
											/>
										) : (
											<>
												{isReordering && items.length > 1 ? (
													<DndContext
														sensors={sensors}
														collisionDetection={closestCenter}
														onDragEnd={(e) => handleDragEnd(e, p.phase, items)}
													>
														<SortableContext
															items={items.map((it) => it.step._key)}
															strategy={verticalListSortingStrategy}
														>
															<div className='divide-y divide-white/[0.06]'>
																{items.map(({ step }) => (
																	<SortableJourneyRow key={step._key} step={step} />
																))}
															</div>
														</SortableContext>
													</DndContext>
												) : (
													<div>
														{items.map(({ step, index }, idx) => (
															<JourneyRow
																key={step._key}
																step={step}
																index={index}
																clientPayment={clientPayment}
																projectId={projectId}
																isFirst={idx === 0}
																isLast={idx === items.length - 1}
															/>
														))}
													</div>
												)}

												<div className='flex items-center gap-2 px-3 lg:px-4 py-2.5 border-t border-white/[0.06]'>
													{isReordering ? (
														<button
															onClick={() => toggleReordering(p.phase)}
															className='inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors'
														>
															<TbCheck size={12} />
															Done Reordering
														</button>
													) : (
														<>
															<button
																onClick={() => toggleAdding(p.phase)}
																className='inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors'
															>
																<TbPlus size={12} />
																Add Step
															</button>
															{items.length > 1 && (
																<button
																	onClick={() => toggleReordering(p.phase)}
																	className='inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full border border-white/15 text-white/50 hover:text-white hover:bg-white/[0.06] transition-colors'
																>
																	<TbArrowsSort size={12} />
																	Reorder
																</button>
															)}
														</>
													)}
												</div>

												{!isReordering && adding[p.phase] && (
													<AddStepInlineRow
														phase={p.phase}
														projectId={projectId}
														onDone={() => stopAdding(p.phase)}
													/>
												)}
											</>
										)}
									</div>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}