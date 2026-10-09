import Link from 'next/link';
import { TbArrowLeft } from 'react-icons/tb';

const variantStyles = {
	internal: { back: 'text-teal', label: 'text-teal' },
	designer: { back: 'text-purple', label: 'text-purple' },
	client: { back: 'text-teal', label: 'text-teal' },
};

const MONTHS = [
	'Jan',
	'Feb',
	'Mar',
	'Apr',
	'May',
	'Jun',
	'Jul',
	'Aug',
	'Sep',
	'Oct',
	'Nov',
	'Dec',
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
		<div className='mb-8'>
			{/* Internal already has the sticky client/project breadcrumb bar
			    above this component — rendering a second back link here
			    would be redundant. Designer and client portals have no
			    equivalent, so this is their only way back. */}
			{backHref && variant !== 'internal' && (
				<Link
					href={backHref}
					className={`inline-flex items-center gap-1.5 font-mono text-xs tracking-widest uppercase mb-4 opacity-70 hover:opacity-100 transition-opacity ${s.back}`}
				>
					<TbArrowLeft className='text-sm' />
					{backLabel || 'Back'}
				</Link>
			)}

			<div className='grid items-start md:flex md:justify-between md:items-center gap-4'>
				<div className='grid gap-1 lg:gap-2'>
					<h1 className='font-display font-medium text-lg lg:text-3xl 3xl:text-4xl text-white/95'>
						{clientName}
					</h1>
					<p className='text-sm lg:text-base text-white/55'>{projectName}</p>

					{month && year && (
						<span className='font-mono text-[11px] text-white/35 mt-1'>
							 — {formatMonth(month)} {year}
						</span>
					)}
				</div>
				<div className='grid place-items-start gap-4'>
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
			</div>
		</div>
	);
}