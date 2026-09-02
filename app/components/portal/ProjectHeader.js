import Link from 'next/link';

const variantStyles = {
	internal: { back: 'text-teal', label: 'text-teal' },
	designer: { back: 'text-purple', label: 'text-purple' },
	client: { back: 'text-teal', label: 'text-teal' },
};

const MONTHS = [
	'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
	'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatMonth(month) {
	const n = Number(month);
	return Number.isInteger(n) && n >= 1 && n <= 12 ? MONTHS[n - 1] : month;
}

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
	const s = variantStyles[variant] || variantStyles.internal;

	return (
		<div className='mb-6'>
			<div className='flex items-center justify-between gap-4 mb-4 lg:mb-6'>
				<Link
					href={backHref}
					className={`font-mono text-xs tracking-widest uppercase hover:opacity-70 transition-opacity ${s.back}`}
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

			<div className='grid gap-1 lg:gap-2'>
				<h1 className='text-lg lg:text-4xl 3xl:text-4xl text-white/95'>
					{projectName}
				</h1>
				<p className='text-sm lg:text-base text-white/55'>{clientName}</p>

				{month && year && (
					<span className='font-mono text-[11px] text-white/35 mt-1 '>
						Initial contact — {formatMonth(month)} {year}
					</span>
				)}
			</div>
		</div>
	);
}