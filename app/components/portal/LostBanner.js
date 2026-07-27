export default function LostBanner({ reason, month, year }) {
	return (
		<div className='mt-8 border border-danger/25 bg-danger/[0.06] rounded-xl px-5 lg:px-6 py-5 mb-8'>
			<div className='flex items-center gap-2 mb-2'>
				<span className='font-mono text-[10px] tracking-widest uppercase text-danger/70'>
					Lost
				</span>
				{month && year && (
					<span className='font-mono text-[11px] text-white/30'>
						· contacted {month}/{year}
					</span>
				)}
			</div>
			{reason ? (
				<p className='text-sm text-white/70 leading-relaxed'>{reason}</p>
			) : (
				<p className='text-sm text-white/30 italic'>No reason recorded.</p>
			)}
		</div>
	);
}