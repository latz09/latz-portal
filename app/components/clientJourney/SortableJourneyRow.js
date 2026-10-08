'use client';

import { TbGripVertical, TbStarFilled } from 'react-icons/tb';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { stepTitle } from '@/app/utils/journeyHelpers';

export default function SortableJourneyRow({ step }) {
	const title = stepTitle(step);
	const isMilestone = (step.generators || []).some((g) => g?.isMilestone);

	const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
		useSortable({ id: step._key });

	const style = { transform: CSS.Transform.toString(transform), transition };

	return (
		<div
			ref={setNodeRef}
			style={style}
			className={`flex items-center gap-2.5 px-3 lg:px-4 py-2.5 bg-[#0d0f14] ${isDragging ? 'opacity-50' : ''}`}
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
			{isMilestone && <TbStarFilled className='text-warning text-xs shrink-0' />}
			<span className='text-sm text-white/80 truncate'>{title}</span>
		</div>
	);
}