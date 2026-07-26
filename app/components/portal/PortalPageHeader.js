const variantStyles = {
	internal: 'text-teal',
	designer: 'text-purple',
	client: 'text-teal',
};

export default function PortalPageHeader({ variant, label, title }) {
	const color = variantStyles[variant];
	return (
		<div className='mb-4'>
			<p
				className={`font-mono text-[11px] tracking-widest uppercase ${color}/70 mb-1`}
			>
				{label}
			</p>
			<h1 className='text-lg lg:text-xl font-semibold text-white'>{title}</h1>
		</div>
	);
}
