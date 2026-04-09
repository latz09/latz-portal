import { signIn } from '@/auth';
import { TbBrandGoogle } from 'react-icons/tb';

export default function LoginPage() {
	return (
		<div className='min-h-screen flex items-center justify-center bg-linear-to-b from-dark-mid via-dark to-dark-mid'>
			<div className='bg-white/5 border border-white/30 rounded p-5 shadow-lg  lg:p-10 flex flex-col items-center gap-6 w-full max-w-sm'>
				<div className='text-center'>
					<p className='text-white/40 text-sm'>Latz Portal</p>
					<h1 className='text-xl font-semibold mt-1'>Sign In</h1>
				</div>
				<form
					action={async () => {
						'use server';
						await signIn('google', { redirectTo: '/' });
					}}
					className='w-full'
				>
					<button
						type='submit'
						className='w-full flex cursor-pointer items-center justify-center gap-3 bg-teal/40 hover:bg-teal transition rounded-xl px-5 py-3 text-sm font-medium'
					>
						<TbBrandGoogle size={18} />
						Continue with Google
					</button>
				</form>
			</div>
		</div>
	);
}
