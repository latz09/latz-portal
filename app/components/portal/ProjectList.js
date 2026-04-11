'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const statusColors = {
	active: 'text-teal',
	complete: 'text-white/70 italic line-through',
	'on-hold': 'text-warning',
	potential: 'text-white/40',
};

export default function ProjectList({ projects, clientSlug }) {
	const [selected, setSelected] = useState(0);
	const router = useRouter();

	useEffect(() => {
		const handler = (e) => {
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				setSelected((s) => Math.min(s + 1, projects.length - 1));
			}
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				setSelected((s) => Math.max(s - 1, 0));
			}
			if (e.key === 'Enter') {
				router.push(`/clients/${clientSlug}/${projects[selected].slug}`);
			}
		};
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [selected, projects, clientSlug, router]);

	return (
		<div className='flex flex-col gap-3 max-w-4xl mx-auto w-full'>
			{projects.map((project, i) => (
				<Link
					key={project.slug}
					href={`/clients/${clientSlug}/${project.slug}`}
					className={`flex flex-col gap-4 border rounded-xl px-6 py-4 transition-colors ${
						i === selected
							? 'bg-white/10 border-white/30'
							: 'bg-white/5 hover:bg-white/10 border-white/10'
					}`}
					onMouseEnter={() => setSelected(i)}
				>
					<div className='flex justify-between'>
						<span className='font-medium lg:text-lg'>{project.name}</span>
						<span
							className={`font-mono text-xs lg:text-sm font-bold uppercase ${statusColors[project.status]}`}
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
	);
}
