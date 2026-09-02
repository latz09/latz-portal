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
			<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 lg:p-4'>
				<p className='font-mono text-[10px] tracking-wide uppercase text-white/40 mb-2'>
					Est. completion
				</p>
				<p className='text-base font-medium text-teal mb-1'>
					{formatShortDate(endLow)} – {formatShortDate(endHigh)}
				</p>
				<p className='font-mono text-xs text-white/35'>
					{estimateWeeksLow}–{estimateWeeksHigh} wks from deposit
				</p>
			</div>
		);
	}

	return (
		<div className='bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 lg:p-4'>
			<p className='font-mono text-[10px] tracking-wide uppercase text-white/40 mb-2'>
				Est. timeline
			</p>
			<p className='text-base font-medium text-white/80 mb-1'>
				{estimateWeeksLow}–{estimateWeeksHigh} weeks
			</p>
			<p className='font-mono text-xs text-white/35'>
				starts once deposit is paid
			</p>
		</div>
	);
}