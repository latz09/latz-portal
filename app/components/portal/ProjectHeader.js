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
}) {
	const s = variantStyles[variant];

	return (
		<div className='mb-12'>
			<Link
				href={backHref}
				className={`font-mono text-xs text-white tracking-widest uppercase hover:opacity-70 transition-opacity`}
			>
				← {backLabel}
			</Link>
			<p
				className={`font-mono text-end text-xs ${s.label} tracking-widest uppercase mt-4 mb-2`}
			>
				LWD ·{' '}
				{variant === 'designer'
					? 'Designer'
					: variant === 'client'
						? 'Client Portal'
						: 'Internal'}
			</p>
			<div className='flex items-center gap-4 mt-2'>
				<h1 className='text-4xl font-semibold'>{clientName}</h1>
				{month && year && (
					<span className='font-mono text-xs text-white/40'>
						{month}/{year}
					</span>
				)}
			</div>
			<p className='text-white/40 mt-2'>{projectName}</p>
		</div>
	);
}
