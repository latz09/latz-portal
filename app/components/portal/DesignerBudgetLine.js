import { designerStatusLabel, designerStatusClassName } from '@/app/utils/designerStatusDisplay';

// Designer-facing only. Intentionally only accepts designerPayment —
// there is no clientPayment prop here at all, so the client's total
// project price has no path into this component even by accident.

export default function DesignerBudgetLine({ designerPayment }) {
	if (!designerPayment?.assigned) return null;

	const { quoteLow, quoteHigh, status } = designerPayment;

	const amountLabel =
		quoteLow && quoteHigh ? `$${quoteLow}–$${quoteHigh}` : 'No budget set yet';

	const overrideClass = designerStatusClassName(status);

	return (
		<p className='font-mono text-xs lg:text-sm text-white/50 mb-6'>
			Design budget: <span className='text-purple'>{amountLabel}</span>
			{' · '}
			<span className={overrideClass || 'text-white/60 capitalize'}>
				{designerStatusLabel(status)}
			</span>
		</p>
	);
}