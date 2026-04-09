import StudioLink from './StudioLink';

export default function PortalLinks({ clientSlug, projectSlug, studioId }) {
	return (
		<>
			<div className='mt-12 pt-8 border-t border-white/10 mb-4 lg:mb-8'>
				<p className='font-mono text-xs text-white/30 tracking-widest uppercase mb-4'>
					Portal Links
				</p>
				<div className='flex flex-col gap-3'>
					<div className='flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4'>
						<div className='flex items-center justify-between'>
							<span className='font-mono text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning'>
								client
							</span>
							<a
								href={`/portal/client/${clientSlug}/${projectSlug}`}
								target='_blank'
								className='font-mono text-xs text-teal hover:opacity-70 transition-opacity'
							>
								Open →
							</a>
						</div>
						<span className='text-xs text-white/40 font-mono break-all'>
							/portal/client/{clientSlug}/{projectSlug}
						</span>
					</div>

					<div className='flex flex-col gap-3 bg-white/5 border border-white/10 rounded-xl px-6 py-4'>
						<div className='flex items-center justify-between'>
							<span className='font-mono text-xs px-2 py-0.5 rounded-full bg-purple/20 text-purple'>
								designer
							</span>
							<a
								href={`/portal/designer/${clientSlug}/${projectSlug}`}
								target='_blank'
								className='font-mono text-xs text-purple hover:opacity-70 transition-opacity'
							>
								Open →
							</a>
						</div>
						<span className='text-xs text-white/40 font-mono break-all'>
							/portal/designer/{clientSlug}/{projectSlug}
						</span>
					</div>
				</div>
			</div>

			<div className='fixed bottom-0 left-1/2 -translate-x-1/2 mb-4'>
				<StudioLink id={studioId} />
			</div>
		</>
	);
}