'use client';

import { useState } from 'react';
import ClientProjectList from './ClientProjectList';
import UpcomingDeadlines from './UpcomingDeadlines';
import ProjectsTable from './ProjectsTable';

export default function DesignerHomeView({ clients, handoffClients, tableProjects }) {
	const [view, setView] = useState('table');

	return (
		<div>
			<div className='flex gap-2 mb-8'>
				<button
					onClick={() => setView('cards')}
					className={`font-mono text-xs px-4 py-2 rounded-full border transition-colors ${
						view === 'cards'
							? 'bg-purple/20 text-purple border-purple/40'
							: 'text-white/40 border-white/10 hover:text-white/60'
					}`}
				>
					Cards
				</button>
				<button
					onClick={() => setView('table')}
					className={`font-mono text-xs px-4 py-2 rounded-full border transition-colors  ${
						view === 'table'
							? 'bg-purple/20 text-purple border-purple/40'
							: 'text-white/40 border-white/10 hover:text-white/60'
					}`}
					
				>
					Table
				</button>
			</div>

			{view === 'cards' ? (
				<>
					<ClientProjectList
						variant='designer'
						clients={clients}
						hrefBuilder={(clientSlug, projectSlug) =>
							`/portal/designer/${clientSlug}/${projectSlug}`
						}
					/>
					<UpcomingDeadlines clients={clients} variant='designer' />

					{handoffClients?.length > 0 && (
						<div className='mt-16 pt-8 border-t border-white/10'>
							<p className='font-mono text-sm lg:text-base tracking-widest uppercase mb-2 text-white/50'>
								Awaiting Client / In Build
							</p>
							<p className='text-sm lg:text-base text-white/75 mb-6'>
								{`These are moving forward outside the design phase — either waiting on the client to respond (feedback, direction choice, approval) or in active development. No design action needed unless you're flagged directly.`}
							</p>
							<ClientProjectList
								variant='designer'
								clients={handoffClients}
								hrefBuilder={(clientSlug, projectSlug) =>
									`/portal/designer/${clientSlug}/${projectSlug}`
								}
							/>
						</div>
					)}
				</>
			) : (
				<ProjectsTable projects={tableProjects} variant='designer' />
			)}
		</div>
	);
}