import crypto from 'crypto'
import { JOURNEY_TEMPLATES } from '@/app/data/journeyTemplates'

export function isValidTemplateKey(key) {
	return Object.prototype.hasOwnProperty.call(JOURNEY_TEMPLATES, key)
}

export function buildJourneyStepsFromTemplate(templateKey) {
	const template = JOURNEY_TEMPLATES[templateKey]
	if (!template) return []
	return template.generatorIds.map((generatorId) => ({
		_key: `step-${crypto.randomUUID()}`,
		status: 'todo',
		generators: [
			{
				_type: 'reference',
				_key: `gen-${crypto.randomUUID()}`,
				_ref: generatorId,
			},
		],
	}))
}

const STANDARD_DEFAULT_DOCS = [
	{ label: 'Project Overview', filename: 'overview.html', category: 'overview', audience: ['internal'] },
	{ label: 'Proposal', filename: 'proposal.html', category: 'overview', audience: ['internal'] },
	{ label: 'Design Brief', filename: 'designBrief.html', category: 'design', audience: ['internal', 'designer'] },
	{ label: 'Wireframe', filename: 'wireframe.html', category: 'design', audience: ['internal', 'designer', 'client'] },
	{ label: 'Asset Collection', filename: 'assetCollection.html', category: 'overview', audience: ['internal', 'client'] },
]

export function buildDefaultDocsFromTemplate(templateKey) {
	if (templateKey !== 'standard') return []
	return STANDARD_DEFAULT_DOCS.map((doc) => ({
		_key: crypto.randomUUID(),
		...doc,
	}))
}