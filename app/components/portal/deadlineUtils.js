export function getDeadlineStatus(dateStr) {
	const [year, month, day] = dateStr.split('-').map(Number);
	const date = new Date(year, month - 1, day);

	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
				<p className='text-xl font-semibold leading-none text-warning'>!</p>
				<p className='font-mono text-xs text-warning mt-1'>today</p>
			</div>
		);

	if (isPast)
		return (
			<div className='text-center shrink-0'>
				<p className='text-2xl font-semibold leading-none text-danger'>
					{Math.abs(daysUntil)}
				</p>
				<p className='font-mono text-xs text-danger mt-1'>
					{Math.abs(daysUntil) === 1 ? 'day ago' : 'days ago'}
				</p>
			</div>
		);

	return (
		<div className='text-center shrink-0'>
			<p className={`text-2xl font-semibold leading-none text-white/80`}>
				{daysUntil}
			</p>
			<p className={`font-mono text-xs ${accentColor} mt-1`}>
				{daysUntil === 1 ? 'day' : 'days'}
			</p>
		</div>
	);
}
