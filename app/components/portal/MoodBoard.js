'use client';

import { useState } from 'react';
import Image from 'next/image';
import {
	TbPhoto,
	TbChevronDown,
	TbX,
	TbChevronLeft,
	TbChevronRight,
} from 'react-icons/tb';

function groupByCategory(images) {
	return images.reduce((acc, img) => {
		const key = img.category?.trim() || 'Uncategorized';
		if (!acc[key]) acc[key] = [];
		acc[key].push(img);
		return acc;
	}, {});
}

export default function MoodBoard({ inspiration, variant }) {
	const [open, setOpen] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState({});
	const [lightbox, setLightbox] = useState(null);

	if (!inspiration?.length) return null;

	const grouped = groupByCategory(inspiration);
	const categories = Object.keys(grouped);

	const iconColor = variant === 'designer' ? 'text-purple' : 'text-teal';
	const badgeBg =
		variant === 'designer'
			? 'bg-purple/20 text-purple'
			: 'bg-teal/20 text-teal';

	function toggleCategory(cat) {
		setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
	}

	function openLightbox(images, index) {
		setLightbox({ images, index });
	}

	function closeLightbox() {
		setLightbox(null);
	}

	function prevImage() {
		setLightbox((prev) => ({
			...prev,
			index: (prev.index - 1 + prev.images.length) % prev.images.length,
		}));
	}

	function nextImage() {
		setLightbox((prev) => ({
			...prev,
			index: (prev.index + 1) % prev.images.length,
		}));
	}

	return (
		<>
			{/* Document card trigger */}
			<button
				onClick={() => setOpen(true)}
				className='flex flex-col bg-white/5 hover:bg-white/10 border border-white/10 rounded p-4 min-h-40 lg:min-h-44 transition-colors w-full text-left'
			>
				<TbPhoto className={`text-2xl ${iconColor} shrink-0`} />
				<div className='flex flex-col justify-end flex-1 gap-2 mt-auto pt-4'>
					<span className='font-medium text-sm leading-tight'>Moodboard</span>
					<span
						className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${badgeBg} w-fit`}
					>
						{inspiration.length} images
					</span>
				</div>
			</button>

			{/* Moodboard modal */}
			{open && (
				<div className='fixed inset-0 z-50 bg-dark/60 backdrop-blur-sm flex flex-col'>
					{/* Header */}
					<div className='flex items-center justify-between px-6 py-5 border-b border-white/10 shrink-0'>
						<div>
							<p className='font-mono text-xs text-white/30 tracking-widest uppercase mb-1'>
								Project
							</p>
							<h2 className='text-xl font-semibold'>Moodboard</h2>
						</div>
						<button
							onClick={() => setOpen(false)}
							className='p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors'
						>
							<TbX size={20} />
						</button>
					</div>

					{/* Accordion body */}
					<div className='flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-3 max-w-4xl w-full mx-auto'>
						{categories.map((cat) => {
							const images = grouped[cat];
							const isExpanded = expandedCategories[cat];
							return (
								<div
									key={cat}
									className='border border-white/10 rounded-xl overflow-hidden'
								>
									<button
										onClick={() => toggleCategory(cat)}
										className='w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors'
									>
										<div className='flex items-center gap-3'>
											<span className='font-medium'>{cat}</span>
											<span
												className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${badgeBg}`}
											>
												{images.length}
											</span>
										</div>
										<TbChevronDown
											size={18}
											className={`text-white/40 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
										/>
									</button>

									{isExpanded && (
										<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-4 bg-white/20'>
											{images.map((img, idx) => (
												<button
													key={idx}
													onClick={() => openLightbox(images, idx)}
													className='aspect-video rounded overflow-hidden bg-white/10 hover:ring-2 hover:ring-white/20 transition-all relative'
												>
													<Image
														src={img.url}
														alt={img.caption || cat}
														fill
														className='object-cover'
														sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw'
													/>
												</button>
											))}
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			)}

			{/* Lightbox */}
			{lightbox && (
				<div
					className='fixed inset-0 z-60 bg-dark-mid/70 backdrop-blur-sm flex flex-col'
					onClick={closeLightbox}
				>
					<div
						className='flex flex-col flex-1 w-full max-w-5xl mx-auto px-6 py-6'
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close button — always at top */}
						<div className='flex justify-end mb-4 shrink-0'>
							<button
								onClick={closeLightbox}
								className='p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors'
							>
								<TbX size={18} />
							</button>
						</div>

						{/* Image — fills remaining space */}
						<div className='relative flex-1 rounded overflow-hidden'>
							<Image
								src={lightbox.images[lightbox.index].url}
								alt={lightbox.images[lightbox.index].caption || ''}
								fill
								className='object-contain'
								sizes='100vw'
							/>
						</div>

						{/* Caption + nav — always at bottom */}
						<div className='shrink-0 flex flex-col items-center gap-3 mt-4'>
							{lightbox.images[lightbox.index].caption && (
								<p className='font-mono text-sm text-white/70 text-center'>
									{lightbox.images[lightbox.index].caption}
								</p>
							)}
							{lightbox.images.length > 1 && (
								<div className='flex gap-3 items-center'>
									<button
										onClick={prevImage}
										className='p-2 rounded-full bg-teal hover:bg-teal/70 transition-colors'
									>
										<TbChevronLeft size={18} />
									</button>
									<span className='font-mono text-xs text-white/30'>
										{lightbox.index + 1} / {lightbox.images.length}
									</span>
									<button
										onClick={nextImage}
										className='p-2 rounded-full bg-teal hover:bg-teal/70 transition-colors'
									>
										<TbChevronRight size={18} />
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</>
	);
}
