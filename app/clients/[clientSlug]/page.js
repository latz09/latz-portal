import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_QUERY';
import Link from 'next/link';

const statusColors = {
	active: 'text-teal ',
	complete: 'text-white/70 italic line-through',
	'on-hold': 'text-warning',
};

export default async function ClientPage({ params }) {
	const { clientSlug } = await params;
	const data = await f(Q, { clientSlug });
	const { name, slug, projects } = data;

	return (
		<main className='px-6 py-16'>
			<div className='max-w-4xl mx-auto mb-12'>
				<Link
					href='/'
					className='font-mono text-xs text-white tracking-widest uppercase hover:opacity-70 transition-opacity'
				>
					← Portal
				</Link>
				<h1 className='text-4xl font-semibold mt-4'>{name}</h1>
			</div>

			<div className='flex flex-col gap-3 max-w-4xl mx-auto w-full'>
				{projects.map((project) => (
					<Link
						key={project.slug}
						href={`/clients/${slug}/${project.slug}`}
						className='flex flex-col gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors'
					>
						<div className='flex justify-between'>
							<span className='font-medium lg:text-lg'>{project.name}</span>
							<span
								className={`font-mono text-xs lg:text-sm font-bold uppercase   ${statusColors[project.status]}`}
							>
								{project.status}
							</span>
						</div>
						<div className='flex items-center justify-between'>
							<span className='font-mono text-xs lg:text-sm text-white/70'>
								{project.month}/{project.year}
							</span>
							<span className='font-mono text-xs lg:text-sm text-warning'>
								{project.docCount} documents
							</span>
						</div>
					</Link>
				))}
			</div>
		</main>
	);
}

export const revalidate = 10;
