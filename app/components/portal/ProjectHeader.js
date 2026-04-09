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
				className={`font-mono opacity-70 lg:text-end text-xs ${s.label} tracking-widest uppercase mt-4 mb-2`}
			>
				LWD ·{' '}
				{variant === 'designer'
					? 'Alyssa'
					: variant === 'client'
						? 'Client Portal'
						: 'Internal'}
			</p>
			<div className='grid gap-2 mt-2'>
				<h1 className='text-4xl font-semibold'>{clientName}</h1>
				<p className=' mb-1 text-warning'>{projectName}</p>
				{month && year && (
					<span className='font-mono text-xs text-white/70'>
						{month}/{year}
					</span>
				)}
			</div>
			
		</div>
	);
}
