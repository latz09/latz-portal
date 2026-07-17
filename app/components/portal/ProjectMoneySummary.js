// Internal-only. Never pass this data into designer/client portal queries —
// FETCH_DESIGNER_PORTAL_QUERY and FETCH_CLIENT_PORTAL_QUERY intentionally
// don't select clientPayment/designerPayment, so this component simply
// never receives anything to render on those pages.

function formatMoney(n) {
	if (n === undefined || n === null) return null;
	return `$${n.toLocaleString()}`;
}

export default function ProjectMoneySummary({ clientPayment, designerPayment }) {
	const hasClient = !!clientPayment?.totalAmount;
	const hasDesigner = !!designerPayment?.assigned;

	if (!hasClient && !hasDesigner) return null;

	return (
		<div className='flex flex-col gap-1.5 mb-6'>
			{hasClient && (
				<p className='font-mono text-xs lg:text-sm text-white/50'>
					Client:{' '}
					<span className='text-white'>
						{formatMoney(clientPayment.totalAmount)}
					</span>
					{' · '}
					<span
						className={
							clientPayment.depositPaid ? 'text-teal' : 'text-white/40'
						}
					>
						{clientPayment.depositPaid ? '✓ deposit paid' : 'deposit unpaid'}
					</span>
					{' · '}
					<span
						className={clientPayment.finalPaid ? 'text-teal' : 'text-white/40'}
					>
						{clientPayment.finalPaid ? '✓ final paid' : 'final unpaid'}
					</span>
				</p>
			)}
			{hasDesigner && (
				<p className='font-mono text-xs lg:text-sm text-white/50'>
					Designer:{' '}
					<span className='text-purple'>
						{designerPayment.actualAmount
							? formatMoney(designerPayment.actualAmount)
							: designerPayment.quoteLow && designerPayment.quoteHigh
								? `${formatMoney(designerPayment.quoteLow)}–${formatMoney(designerPayment.quoteHigh)} quoted`
								: 'no quote set'}
					</span>
					{' · '}
					<span className='text-white/60 capitalize'>
						{(designerPayment.status || 'not-started').replace('-', ' ')}
					</span>
				</p>
			)}
		</div>
	);
}