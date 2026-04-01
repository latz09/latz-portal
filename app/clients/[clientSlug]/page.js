import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_QUERY';
import Link from 'next/link';

const statusColors = {
	active: 'bg-green-500/20 text-green-400',
	complete: 'bg-white/10 text-white/40',
	'on-hold': 'bg-orange-500/20 text-orange-400',
};

export default async function ClientPage({ params }) {
	const { clientSlug } = await params;
	const data = await f(Q, { clientSlug });
	const { name, slug, projects } = data;

	return (
		<main className='max-w-4xl mx-auto px-6 py-16'>
			<div className='mb-12'>
				<Link
					href='/'
					className='font-mono text-xs text-[#18a1ad] tracking-widest uppercase hover:opacity-70 transition-opacity'
				>
					← Portal
				</Link>
				<h1 className='text-4xl font-semibold mt-4'>{name}</h1>
			</div>

			<div className='flex flex-col gap-3'>
				{projects.map((project) => (
					<Link
						key={project.slug}
						href={`/clients/${slug}/${project.slug}`}
						className='flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors'
					>
						<div className='flex items-center gap-4'>
							<span className='font-medium'>{project.name}</span>
							<span
								className={`font-mono text-xs px-2 py-0.5 rounded-full ${statusColors[project.status]}`}
							>
								{project.status}
							</span>
						</div>
						<div className='flex items-center gap-4'>
							<span className='font-mono text-xs text-white/40'>
								{project.month}/{project.year}
							</span>
							<span className='font-mono text-xs text-white/40'>
								{project.docCount} docs
							</span>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}

export const revalidate = 10;