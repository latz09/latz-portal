'use client';

import { useState } from 'react';
import Image from 'next/image';
import { TbPhoto, TbChevronDown, TbX } from 'react-icons/tb';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Captions from 'yet-another-react-lightbox/plugins/captions';
import 'yet-another-react-lightbox/plugins/captions.css';

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
	const [lightbox, setLightbox] = useState({
		open: false,
		index: 0,
		slides: [],
	});

	if (!inspiration?.length) return null;

	const grouped = groupByCategory(inspiration);
	const categories = Object.keys(grouped);

	const iconColor = variant === 'designer' ? 'text-purple' : 'text-teal';
	const badgeBg =
		variant === 'designer'
			? 'bg-purple/20 text-purple'
			: 'bg-teal/10 text-teal';
	const accentColor = variant === 'designer' ? '#d946ef' : '#18a1ad';

	function toggleCategory(cat) {
		setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
	}

	function openLightbox(images, index) {
		setLightbox({
			open: true,
			index,
			slides: images.map((img) => ({
				src: img.url,
				alt: img.caption || '',
				description: img.caption || '',
			})),
		});
	}

	function closeLightbox() {
		setLightbox((prev) => ({ ...prev, open: false }));
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
									className='border border-white/10 rounded-xl bg-dark overflow-hidden'
								>
									<button
										onClick={() => toggleCategory(cat)}
										className='w-full flex items-center justify-between px-5 py-4 bg-white/5 hover:bg-white/10 transition-colors'
									>
										<div className='flex items-center gap-3'>
											<span className='font-medium'>{cat}</span>
											<span
												className={`font-mono text-sm lg:text-base px-1.5 py-0.5 rounded-full ${badgeBg}`}
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

			{/* YARL Lightbox */}
			<Lightbox
				open={lightbox.open}
				close={closeLightbox}
				index={lightbox.index}
				slides={lightbox.slides}
				plugins={[Captions, Zoom, Thumbnails]}
				animation={{ fade: 300, swipe: 400 }}
				styles={{
					root: {
						'--yarl__color_backdrop': 'rgba(15, 26, 46, 0.95)',
						'--yarl__color_button': '#ededed',
						'--yarl__color_button_hover': accentColor,
						'--yarl__color_button_active': accentColor,

						'--yarl__thumbnails_track_background_color': 'transparent',
						'--yarl__thumbnails_thumbnail_background_color': 'transparent',
						'--yarl__thumbnails_thumbnail_border_color': 'transparent',
						'--yarl__thumbnails_thumbnail_border_color_active': accentColor,
						'--yarl__thumbnails_thumbnail_border_radius': '0.25rem',
						'--yarl__thumbnails_thumbnail_padding': '0px',
						'--yarl__navigation_button_size': '40px',
						'--yarl__navigation_button_border_radius': '9999px',
						'--yarl__captions_title_color': '#ededed',
						'--yarl__captions_description_color': 'rgba(237, 237, 237, 0.6)',
					},
					navigationButton: {
						backgroundColor: 'rgba(255,255,255,0.05)',
						backdropFilter: 'blur(3px)',
						border: '1px solid rgba(255,255,255,0.1)',
						boxShadow: 'none',
					},
					slide: {
						borderRadius: '0.25rem',
						overflow: 'hidden',
					},
					toolbar: {
						backgroundColor: 'transparent',
					},
					thumbnail: {
						border: 'none',
						borderRadius: '0.25rem',
					},
					thumbnailsContainer: {
						backgroundColor: 'rgba(15, 26, 46, 0.95)',
						background: 'rgba(15, 26, 46, 1)',
					},
					captionsTitle: {
						fontSize: '0.875rem',
						fontFamily: 'var(--font-dm-mono)',
						textAlign: 'center',
						width: '100%',
						display: 'flex',
						justifyContent: 'center',
					},
					captionsDescriptionContainer: {
						backgroundColor: 'rgba(15, 26, 46, 0.65)',
						display: 'flex',
						justifyContent: 'center',
						padding: '0.75rem 1.5rem',
						backdropFilter: 'blur(2px)',
					},
				}}
			/>
		</>
	);
}
