// Displays the proposal week-estimate ("4-6 weeks") as a computed date
// range once the deposit invoice is marked paid — that's the "timer start."
// Before the deposit is paid, just shows the raw week estimate.

function parseLocalDate(dateStr) {
	const [year, month, day] = dateStr.split('-').map(Number);
	return new Date(year, month - 1, day);
}

function formatShortDate(date) {
	return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ProjectTimeline({
	estimateWeeksLow,
	estimateWeeksHigh,
	clientPayment,
}) {
	if (!estimateWeeksLow || !estimateWeeksHigh) return null;

	const depositPaid = clientPayment?.depositPaid;
	const depositPaidDate = clientPayment?.depositPaidDate;

	if (depositPaid && depositPaidDate) {
		const start = parseLocalDate(depositPaidDate);

		const endLow = new Date(start);
		endLow.setDate(start.getDate() + estimateWeeksLow * 7);

		const endHigh = new Date(start);
		endHigh.setDate(start.getDate() + estimateWeeksHigh * 7);

		return (
			<p className='font-mono text-xs lg:text-sm text-white/50 mb-6'>
				Est. completion:{' '}
				<span className='text-teal'>
					{formatShortDate(endLow)} – {formatShortDate(endHigh)}
				</span>{' '}
				<span className='text-white/30'>
					({estimateWeeksLow}–{estimateWeeksHigh} wks from deposit)
				</span>
			</p>
		);
	}

	return (
		<p className='font-mono text-xs lg:text-sm text-white/50 mb-6'>
			Est. timeline:{' '}
			<span className='text-white/70'>
				{estimateWeeksLow}–{estimateWeeksHigh} weeks
			</span>{' '}
			<span className='text-white/30'>(starts once deposit is paid)</span>
		</p>
	);
}