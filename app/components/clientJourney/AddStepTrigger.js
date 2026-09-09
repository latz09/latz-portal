'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TbPlus } from 'react-icons/tb'
import AddStepForm from './AddStepForm'

export default function AddStepTrigger({ projectId, className }) {
	const router = useRouter()
	const [open, setOpen] = useState(false)

	return (
		<>
			<button
				type='button'
				onClick={() => setOpen(true)}
				className={
					className ||
					'flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full border border-teal/40 text-teal hover:bg-teal/10 transition-colors shrink-0'
				}
        >
				<TbPlus size={12} />
				Add Step
			</button>
			{open && (
				<AddStepForm
					projectId={projectId}
					onClose={() => setOpen(false)}
					onAdded={() => {
						setOpen(false)
						router.refresh()
					}}
				/>
			)}
		</>
	)
}