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
		<>
			{hasClient && (
				<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 lg:p-4'>
					<p className='font-mono text-[10px] tracking-wide uppercase text-white/40 mb-2'>
						Client payment
					</p>
					<p className='text-base font-medium text-white/90 mb-1'>
						{formatMoney(clientPayment.totalAmount)}
					</p>
					<p className='font-mono text-xs'>
						<span className={clientPayment.depositPaid ? 'text-teal' : 'text-white/35'}>
							{clientPayment.depositPaid ? '✓ deposit paid' : 'deposit unpaid'}
						</span>
						<span className='text-white/25'> · </span>
						<span className={clientPayment.finalPaid ? 'text-teal' : 'text-white/35'}>
							{clientPayment.finalPaid ? '✓ final paid' : 'final unpaid'}
						</span>
					</p>
				</div>
			)}
			{hasDesigner && (
				<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 lg:p-4'>
					<p className='font-mono text-[10px] tracking-wide uppercase text-white/40 mb-2'>
						Designer payment
					</p>
					<p className='text-base font-medium text-purple mb-1'>
						{designerPayment.actualAmount
							? formatMoney(designerPayment.actualAmount)
							: designerPayment.quoteLow && designerPayment.quoteHigh
								? `${formatMoney(designerPayment.quoteLow)}–${formatMoney(designerPayment.quoteHigh)} quoted`
								: 'No quote set'}
					</p>
					<p className='font-mono text-xs text-white/40 capitalize'>
						{(designerPayment.status || 'not-started').replace('-', ' ')}
					</p>
				</div>
			)}
		</>
	);
}