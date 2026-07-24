const ACTIVE_WORK = ['active', 'on-hold'];

function money(n) {
	if (!n) return '$0';
	return `$${Math.round(n).toLocaleString()}`;
}

// What the client owes vs. what's already landed.
function clientNumbers(p) {
	const cp = p.clientPayment;
	const total = cp?.totalAmount || 0;
	if (!total) return { total: 0, collected: 0, outstanding: 0 };
	const deposit = cp?.depositAmount ?? total / 2;
	const final = cp?.finalAmount ?? total - deposit;
	const collected =
		(cp?.depositPaid ? deposit : 0) + (cp?.finalPaid ? final : 0);
	return { total, collected, outstanding: total - collected };
}

// Designer cost, split by whether it's owed now, still in flight, or already paid.
// delivered/invoiced = work is done, you owe it. not-started/in-progress = range.
function designerNumbers(p) {
	const dp = p.designerPayment;
	const zero = { owedNow: 0, inFlightLow: 0, inFlightHigh: 0, paidOut: 0 };
	if (!dp?.assigned) return zero;

	const status = dp.status || 'not-started';
	const actual = dp.actualAmount || 0;
	const low = dp.quoteLow || 0;
	const high = dp.quoteHigh || low;

	if (status === 'paid') {
		return { ...zero, paidOut: dp.amountPaid || actual || high || 0 };
	}
	if (status === 'delivered' || status === 'invoiced') {
		return { ...zero, owedNow: actual || high || 0 };
	}
	return { ...zero, inFlightLow: actual || low, inFlightHigh: actual || high };
}

function Stat({ label, value, sub, tone = 'text-white' }) {
	return (
		<div className='flex flex-col gap-1'>
			<span className='font-mono text-[10px] text-white/30 uppercase tracking-widest'>
				{label}
			</span>
			<span className={`text-xl lg:text-2xl font-semibold tabular-nums ${tone}`}>
				{value}
			</span>
			{sub && <span className='font-mono text-[11px] text-white/35'>{sub}</span>}
		</div>
	);
}

export default function PortfolioSummary({ projects }) {
	// Receivables and payables span all statuses except on-ice — a finished
	// project with an unpaid final is still money in, and an unpaid designer
	// bill on a complete project is still money out.
	const live = projects.filter((p) => p.status !== 'on-ice');
	const activeWork = projects.filter((p) => ACTIVE_WORK.includes(p.status));
	const leads = projects.filter((p) => p.status === 'potential');

	let contractValue = 0;
	let collected = 0;
	let outstanding = 0;
	let owedNow = 0;

	live.forEach((p) => {
		const c = clientNumbers(p);
		contractValue += c.total;
		collected += c.collected;
		outstanding += c.outstanding;

		owedNow += designerNumbers(p).owedNow;
	});

	// In-flight design is future work only — active/on-hold projects.
	let inFlightLow = 0;
	let inFlightHigh = 0;
	activeWork.forEach((p) => {
		const d = designerNumbers(p);
		inFlightLow += d.inFlightLow;
		inFlightHigh += d.inFlightHigh;
	});

	// Total design across the whole book — everything ever paid out, currently
	// owed, and quoted for work in flight. Gives the owed figure some scale.
	const paidOut = projects.reduce(
		(sum, p) => sum + designerNumbers(p).paidOut,
		0,
	);
	const totalDesign = paidOut + owedNow + inFlightHigh;

	const leadValue = leads.reduce((sum, p) => sum + clientNumbers(p).total, 0);

	// Net = what's still coming in, minus everything you owe out.
	const netHigh = outstanding - owedNow - inFlightLow;
	const netLow = outstanding - owedNow - inFlightHigh;
	const netRange =
		netLow === netHigh ? money(netLow) : `${money(netLow)}–${money(netHigh)}`;

	const inFlightRange =
		inFlightLow === inFlightHigh
			? money(inFlightHigh)
			: `${money(inFlightLow)}–${money(inFlightHigh)}`;

	if (!contractValue && !leadValue) return null;

	return (
		<div className='mb-8 border border-white/10 rounded-xl bg-white/[0.03] px-5 lg:px-6 py-5'>
			<div className='grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8'>
				<Stat
					label='Still to collect'
					value={money(outstanding)}
					sub={`${money(collected)} collected of ${money(contractValue)}`}
					tone='text-teal'
				/>
				<Stat
					label='Owed to design now'
					value={money(owedNow)}
					sub={`${money(totalDesign)} total design across book`}
					tone={owedNow > 0 ? 'text-purple' : 'text-white/50'}
				/>
				<Stat
					label='Design in flight'
					value={inFlightRange}
					sub='assigned, not yet delivered'
					tone='text-white/70'
				/>
				<Stat
					label='Net expected'
					value={netRange}
					sub={`of ${money(outstanding)} still coming`}
					tone='text-white'
				/>
			</div>

			{leadValue > 0 && (
				<div className='mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-4'>
					<span className='font-mono text-[11px] text-white/35 uppercase tracking-widest'>
						Leads not yet committed
					</span>
					<span className='font-mono text-sm text-warning tabular-nums'>
						{money(leadValue)}
						<span className='text-white/30 ml-2'>
							{leads.length} project{leads.length === 1 ? '' : 's'}
						</span>
					</span>
				</div>
			)}
		</div>
	);
}