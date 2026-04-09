export function getDeadlineStatus(dateStr) {
	const date = new Date(dateStr + 'T00:00:00');
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const in30 = new Date(today);
	in30.setDate(today.getDate() + 30);

	const isPast = date < today;
	const isToday = date.getTime() === today.getTime();
	const isUpcoming = date <= in30;
	const diffMs = date - today;
	const daysUntil = Math.round(diffMs / (1000 * 60 * 60 * 24));

	return { date, isPast, isToday, isUpcoming, daysUntil };
}

export function formatDate(date) {
	return date.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

export function DaysIndicator({ isPast, isToday, daysUntil, accentColor }) {
	if (isToday)
		return (
			<div className='text-center shrink-0'>
				<p className='text-2xl font-semibold leading-none text-warning'>!</p>
				<p className='font-mono text-xs text-warning mt-1'>today</p>
			</div>
		);

	if (isPast)
		return (
			<div className='text-center shrink-0'>
				<p className='text-2xl font-semibold leading-none text-danger'>
					{Math.abs(daysUntil)}
				</p>
				<p className='font-mono text-xs text-danger mt-1'>days ago</p>
			</div>
		);

	return (
		<div className='text-center shrink-0'>
			<p className={`text-2xl font-semibold leading-none ${accentColor}`}>
				{daysUntil}
			</p>
			<p className={`font-mono text-xs ${accentColor} mt-1`}>days</p>
		</div>
	);
}
