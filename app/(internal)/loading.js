export default function Loading() {
	return (
		<div className='max-w-360 mx-auto px-3 lg:px-6 py-8 flex items-center justify-center min-h-[40vh]'>
			<div className='w-52 h-px bg-white/10 overflow-hidden'>
				<div className='load-sweep h-full w-[29%] bg-teal' />
			</div>
		</div>
	);
}