'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { STATUS_LABELS, STATUS_COLORS } from '@/app/utils/statusConfig';

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
		<div className='max-w-4xl mx-auto w-full bg-white/[0.04] border border-white/[0.08] rounded-xl overflow-hidden'>
			{projects.map((project, i) => (
				<Link
					key={project.slug}
					href={`/clients/${clientSlug}/${project.slug}`}
					onMouseEnter={() => setSelected(i)}
					className={`flex flex-col gap-3 px-5 py-4 transition-colors ${
						i !== projects.length - 1 ? 'border-b border-white/[0.06]' : ''
					} ${i === selected ? 'bg-white/[0.06]' : 'hover:bg-white/[0.06]'}`}
				>
					<div className='flex items-center justify-between gap-3'>
						<span className='font-medium lg:text-lg text-white/90'>
							{project.name}
						</span>
						<span
							className={`font-mono text-[10px] lg:text-xs font-semibold uppercase tracking-widest shrink-0 ${
								STATUS_COLORS[project.status] || 'text-white/40'
							}`}
						>
							{STATUS_LABELS[project.status] || project.status}
						</span>
					</div>
					<div className='flex items-center justify-between'>
						<span className='font-mono text-xs text-white/40'>
							{project.month}/{project.year}
						</span>
						<span className='font-mono text-xs text-white/40'>
							{project.docCount} documents
						</span>
					</div>
				</Link>
			))}
		</div>
	);
}