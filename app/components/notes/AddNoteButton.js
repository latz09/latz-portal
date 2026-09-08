'use client';

import { TbPlus } from 'react-icons/tb';

export default function AddNoteButton({ onClick, hasDraft }) {
	return (
		<button
			onClick={onClick}
			className='fixed z-40 flex items-center justify-center gap-2 font-mono text-xs tracking-widest uppercase border border-warning/30 bg-dark hover:text-white/50 text-warning shadow-lg shadow-dark/40 hover:bg-dark/ hover:border-white/50 transition-colors font-bold cursor-pointer hover:scale-[97%] bottom-[66px] left-1/2 -translate-x-1/2 w-12 h-12 rounded-full sm:bottom-6 sm:left-6 sm:translate-x-0 sm:w-auto sm:h-auto sm:px-4 sm:py-3 sm:rounded-full'
		>
			<TbPlus className='text-lg sm:text-base' />
			<span className='hidden sm:inline'>Add Note</span>
			{hasDraft && (
				<span
					title='Note in progress'
					className='absolute -top-1 -right-1 w-3 h-3 rounded-full bg-teal border-2 border-dark'
				/>
			)}
		</button>
	);
}