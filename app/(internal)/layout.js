import { signOut } from '@/auth';
import InternalNav from '@/app/components/portal/InternalNav';
import StudioLink from '@/app/components/portal/StudioLink';
import Link from 'next/link';

export default function InternalLayout({ children }) {
	return (
		<>
			<div className='sticky top-0 z-40 bg-dark/90 backdrop-blur-sm border-b border-white/10'>
				<div className='max-w-360 mx-auto px-3 lg:px-6 py-3 flex flex-col lg:flex-row lg:items-center gap-3'>

					{/* mobile: title + New Client on one row · desktop: title only */}
					<div className='flex items-center justify-between gap-3 lg:justify-start lg:shrink-0 lg:mr-4'>
						<Link href='/'>
						<p className='text-white/60 text-sm tracking-wider font-semibold'>
							Latz Web Development
						</p>
						</Link>
						<StudioLink className='lg:hidden' />
					</div>

					<InternalNav />

					{/* desktop-only: New Client + Sign Out */}
					<div className='hidden lg:flex items-center gap-2 lg:ml-auto'>
						<StudioLink />
						<form
							action={async () => {
								'use server';
								await signOut({ redirectTo: '/login' });
							}}
						>
							<button
								type='submit'
								className='font-mono text-xs px-4 py-2 rounded-full bg-white/5 text-white/40 hover:bg-danger/20 hover:text-danger transition-colors'
							>
								Sign Out
							</button>
						</form>
					</div>
				</div>
			</div>

			{children}
		</>
	);
}