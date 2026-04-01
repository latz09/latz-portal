import { fetchContent as f } from './utils/cms/fetchContent';
import { FETCH_CLIENTS_QUERY as Q } from './data/queries/pages/FETCH_CLIENTS_QUERY';
import Link from 'next/link';

export default async function Home() {
	const clients = await f(Q);

	return (
		<main className='max-w-4xl mx-auto px-6 py-16'>
			<div className='mb-12'>
				<p className='font-mono text-xs text-[#18a1ad] tracking-widest uppercase mb-2'>
					Latz Web Design
				</p>
				<h1 className='text-4xl font-semibold mb-8'>Latz Portal</h1>

				{/* PORTAL VIEWS */}
				<div className='flex gap-3'>
					<a
						href='/portal/designer'
						target='_blank'
						className='font-mono text-xs px-4 py-2 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors'
					>
						Designer View →
					</a>
				</div>
			</div>

			<div className='flex flex-col gap-3'>
				{clients.map((client) => (
					<Link
						key={client.slug}
						href={`/clients/${client.slug}`}
						className='flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors'
					>
						<span className='font-medium'>{client.name}</span>
						<span className='font-mono text-xs text-white/40'>
							{client.activeProjects} active · {client.totalProjects} total
						</span>
					</Link>
				))}
			</div>
		</main>
	);
}

export const revalidate = 10;
