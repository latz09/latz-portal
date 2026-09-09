import ProjectDetailsForm from '@/app/components/portal/ProjectDetailsForm';

export default function NewClientPage() {
	return (
		<main className='page-enter px-3 lg:px-6 py-5 lg:py-10'>
			<ProjectDetailsForm mode='create' />
		</main>
	);
}