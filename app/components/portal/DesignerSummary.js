export default function DesignerSummary({ projects }) {
	let owed = 0;
	let inFlightLow = 0;
	let inFlightHigh = 0;
	let count = 0;

	projects.forEach((p) => {
		const dp = p.designerPayment;
		if (!dp?.assigned) return;
		count++;
		const status = dp.status || 'not-started';
		const actual = dp.actualAmount || 0;
		const low = dp.quoteLow || 0;
		const high = dp.quoteHigh || low;

		if (status === 'paid') return;
		if (status === 'delivered' || status === 'invoiced') {
			owed += actual || high || 0;
		} else {
			inFlightLow += actual || low;
			inFlightHigh += actual || high;
		}
	});

	if (!count) return null;

	const money = (n) => `$${Math.round(n).toLocaleString()}`;
	const range =
		inFlightLow === inFlightHigh
			? money(inFlightHigh)
			: `${money(inFlightLow)}–${money(inFlightHigh)}`;

	return (
		<p className='font-mono text-[11px] text-white/35 mb-8'>
			<span className='text-purple'> {money(owed)} </span> delivered &amp; awaiting payment
			<span className='text-white/20 mx-2'>·</span>
			<span className='text-white/60'>{range}</span> still to deliver
		</p>
	);
}