import Link from 'next/link';

const variantStyles = {
	internal: { back: 'text-teal', label: 'text-teal' },
	designer: { back: 'text-purple', label: 'text-purple' },
	client: { back: 'text-teal', label: 'text-teal' },
};

export default function ProjectHeader({
	variant,
	backHref,
	backLabel,
	clientName,
	projectName,
	month,
	year,
	action,
}) {
	const s = variantStyles[variant];

	return (
		<div className='mb-6'>
			<div className='flex items-center justify-between gap-4 mb-3 lg:mb-6'>
				<Link
					href={backHref}
					className='font-mono text-xs text-warning tracking-widest uppercase hover:opacity-70 transition-opacity'
				>
					← {backLabel}
				</Link>

				{/* Internal drops the "LWD · Internal" label — the nav bar already
				    says where you are. Designer and client keep it for context. */}
				{action ? (
					<div className='shrink-0'>{action}</div>
				) : variant !== 'internal' ? (
					<p
						className={`font-mono opacity-70 text-xs ${s.label} tracking-widest uppercase shrink-0`}
					>
						LWD · {variant === 'designer' ? 'Alyssa' : 'Client Portal'}
					</p>
				) : null}
			</div>

			<div className='grid gap-1 lg:gap-2 mt-2 lg:mt-4'>
				<p className='text-base lg:text-xl text-white/80'>{projectName}</p>
				<p className='text-xs lg:text-base text-white/80'>{clientName}</p>
				
				{month && year && (
					<span className='font-mono text-xs text-white/70'>
						Initial Contact: {month}/{year}
					</span>
				)}
			</div>
		</div>
	);
}