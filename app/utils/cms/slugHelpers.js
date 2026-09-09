import { writeClient } from './writeClient'
import { slugify } from '@/app/utils/slugify'

export { slugify }

export async function isClientSlugAvailable(slug) {
	const count = await writeClient.fetch(
		`count(*[_type == "client" && slug.current == $slug])`,
		{ slug }
	)
	return count === 0
}

export async function isProjectSlugAvailable(slug, clientId) {
	const count = await writeClient.fetch(
		`count(*[_type == "project" && slug.current == $slug && client._ref == $clientId])`,
		{ slug, clientId }
	)
	return count === 0
}