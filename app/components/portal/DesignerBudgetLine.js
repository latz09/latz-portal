// Designer-facing only. Intentionally only accepts designerPayment —
// there is no clientPayment prop here at all, so the client's total
// project price has no path into this component even by accident.

export default function DesignerBudgetLine({ designerPayment }) {
	if (!designerPayment?.assigned) return null;

	const { quoteLow, quoteHigh, status } = designerPayment;

	const amountLabel =
		quoteLow && quoteHigh ? `$${quoteLow}–$${quoteHigh}` : 'No budget set yet';

	return (
		<p className='font-mono text-xs lg:text-sm text-white/50 mb-6'>
			Design budget: <span className='text-purple'>{amountLabel}</span>
			{' · '}
			<span className='text-white/60 capitalize'>
				{(status || 'not-started').replace('-', ' ')}
			</span>
		</p>
	);
}