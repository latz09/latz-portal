import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_DESIGNER_PORTAL_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_QUERY';

export default async function DesignerPortal({ params }) {
	const { clientSlug, projectSlug } = await params;
	const data = await f(Q, { clientSlug, projectSlug });
	const { name: clientName, project } = data;

	return (
		<main className='max-w-3xl mx-auto px-6 py-16'>
			<div className='mb-12'>
				<a
					href="/portal/designer"
					className='font-mono text-xs text-purple-400 tracking-widest uppercase hover:opacity-70 transition-opacity '
				>
					← All Projects
				</a>
				<p className='font-mono text-xs text-purple-400 tracking-widest uppercase mt-4 mb-2'>
					Latz Web Design · Designer
				</p>
				<h1 className='text-4xl font-semibold'>{clientName}</h1>
				<p className='text-white/40 mt-2'>{project.name}</p>
			</div>

			<div className='mb-8'>
				<p className='font-mono text-xs text-white/30 tracking-widest uppercase mb-4'>
					Project Documents
				</p>
				<div className='flex flex-col gap-3'>
					{project.docs.map((doc) => (
						<a
							key={doc.filename}
							href={`/clients/${project.year}/${clientSlug}/${projectSlug}/${doc.filename}`}
							target='_blank'
							className='flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors'
						>
							<span className='font-medium'>{doc.label}</span>
							<span className='font-mono text-xs text-purple-400'>View →</span>
						</a>
					))}
				</div>
			</div>

			<div className='mt-16 pt-8 border-t border-white/10'>
				<p className='font-mono text-xs text-white/20'>
					Latz Web Design · jordan@latzwebdesign.com
				</p>
			</div>
		</main>
	);
}

export const revalidate = 10;
