'use client';

import { useState } from 'react';
import ProjectMilestones from '@/app/components/portal/ProjectMilestones';
import ProjectAssets from '@/app/components/portal/ProjectAssets';
import JourneyPreview from '@/app/components/clientJourney/JourneyPreview';

export default function JourneySection({
	journeySteps,
	clientPayment,
	clientSlug,
	projectSlug,
	docs,
	resources,
	inspiration,
}) {
	const [open, setOpen] = useState(false);

	return (
		<div className='grid lg:grid-cols-5 gap-6 lg:gap-10 items-start mt-4 mb-6'>
			<div className='lg:col-span-2'>
				{open ? (
					<ProjectAssets
						variant='internal'
						docs={docs}
						resources={resources}
						inspiration={inspiration}
						clientSlug={clientSlug}
						projectSlug={projectSlug}
					/>
				) : (
					<ProjectMilestones
						journeySteps={journeySteps}
						clientPayment={clientPayment}
						clientSlug={clientSlug}
						projectSlug={projectSlug}
					/>
				)}
			</div>
			<div className='lg:col-span-3'>
				<JourneyPreview
					journeySteps={journeySteps}
					clientPayment={clientPayment}
					clientSlug={clientSlug}
					projectSlug={projectSlug}
					open={open}
					onToggle={() => setOpen((o) => !o)}
				/>
			</div>
		</div>
	);
}