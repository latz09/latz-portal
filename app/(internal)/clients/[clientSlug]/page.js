import { notFound } from 'next/navigation';
import { fetchContent as f } from '@/app/utils/cms/fetchContent';
import { FETCH_CLIENT_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENT_QUERY';
import Link from 'next/link';
import { TbPlus } from 'react-icons/tb';
import NoteList from '@/app/components/notes/NoteList';
import ProjectList from '@/app/components/portal/ProjectList';
import StudioLink from '@/app/components/portal/StudioLink';

export default async function ClientPage({ params }) {
	const { clientSlug } = await params;
	const data = await f(Q, { clientSlug });
	if (!data) notFound();
	const { name, slug, projects, notes } = data;

	return (
		<main>
			<div className='sticky top-[var(--nav-h,64px)] z-30 bg-dark-mid/70 backdrop-blur-sm border-b border-dark-mid'>
				<div className='max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-2.5 flex items-center gap-2 font-mono text-xs tracking-widest uppercase'>
					<Link
						href='/dashboard'
						className='text-teal hover:text-teal/70 transition-colors'
					>
						Dashboard
					</Link>
					<span className='text-white/20'>/</span>
					<span className='text-white/50 truncate font-display'>{name}</span>
				</div>
			</div>

			<div className='bg-linear-to-b from-dark-mid/70 via-white/0 to-white/0'>
				<div className='page-enter max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-4 lg:py-10'>
					<div className='grid items-start md:flex md:justify-between md:items-center gap-4 mb-8'>
						<div className='grid gap-1 lg:gap-2'>
							<h1 className='font-display text-lg lg:text-4xl 3xl:text-4xl text-white/95'>
								{name}
							</h1>
							<p className='text-sm lg:text-base text-white/55'>
								{projects?.length || 0}{' '}
								{projects?.length === 1 ? 'project' : 'projects'}
							</p>
						</div>

						<div className='flex items-center gap-2 shrink-0'>
							<Link
								href={`/clients/${slug}/new`}
								className='inline-flex items-center gap-2 bg-dark font-mono text-xs px-4 py-2 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors'
							>
								<TbPlus className='text-sm' />
								New Project
							</Link>
							{/* <StudioLink id={data._id} label='Edit client' /> */}
						</div>
					</div>
				</div>
			</div>

			<div className='page-enter max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-4 lg:py-10'>
				<ProjectList projects={projects} clientSlug={slug} />

				<div className='mt-16 w-full'>
					<NoteList notes={notes} />
				</div>
			</div>
		</main>
	);
}

export const revalidate = 10;