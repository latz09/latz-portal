import StudioLink from './StudioLink';

export default function PortalLinks({ clientSlug, projectSlug, studioId }) {
	return (
		<>
			<div className='mt-12 pt-8 border-t border-white/10'>
				<p className='font-mono text-xs text-white/30 tracking-widest uppercase mb-4'>
					Portal Links
				</p>
				<div className='flex flex-col gap-3'>
					<div className='flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-6 py-4'>
						<div className='flex items-center gap-3'>
							<span className='font-mono text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning'>
								client
							</span>
							<span className='text-sm text-white/40 font-mono'>
								/portal/client/{clientSlug}/{projectSlug}
							</span>
						</div>
						<a
							href={`/portal/client/${clientSlug}/${projectSlug}`}
							target='_blank'
							className='font-mono text-xs text-teal hover:opacity-70 transition-opacity'
						>
							Open →
						</a>
					</div>
					<div className='flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-6 py-4'>
						<div className='flex items-center gap-3'>
							<span className='font-mono text-xs px-2 py-0.5 rounded-full bg-purple/20 text-purple'>
								designer
							</span>
							<span className='text-sm text-white/40 font-mono'>
								/portal/designer/{clientSlug}/{projectSlug}
							</span>
						</div>
						<a
							href={`/portal/designer/${clientSlug}/${projectSlug}`}
							target='_blank'
							className='font-mono text-xs text-purple hover:opacity-70 transition-opacity'
						>
							Open →
						</a>
					</div>
				</div>
			</div>

			<div className='fixed bottom-0 left-1/2 -translate-x-1/2 mb-4'>
				<StudioLink id={studioId} />
			</div>
		</>
	);
}
