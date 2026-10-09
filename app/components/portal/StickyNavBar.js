'use client';

import { useEffect, useRef } from 'react';

export default function StickyNavBar({ children }) {
	const ref = useRef(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const setHeight = () => {
			document.documentElement.style.setProperty(
				'--nav-h',
				`${el.offsetHeight}px`
			);
		};

		setHeight();

		const observer = new ResizeObserver(setHeight);
		observer.observe(el);

		return () => observer.disconnect();
	}, []);

	return (
		<div
			ref={ref}
			className='sticky top-0 z-40 bg-dark/90 backdrop-blur-sm border-b border-white/10'
		>
			{children}
		</div>
	);
}