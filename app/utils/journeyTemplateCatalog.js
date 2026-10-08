import { JOURNEY_TEMPLATES } from '@/app/data/journeyTemplates'
import { PHASE_ORDER, PHASE_LABELS } from '@/app/utils/journeyHelpers'

export function resolveTemplateCatalog(templateKey, generators) {
  const template = JOURNEY_TEMPLATES[templateKey]
  if (!template) return null

  const byId = new Map(generators.map((g) => [g._id, g]))

  const steps = template.generatorIds.map((id) => {
    const doc = byId.get(id)
    return doc ? doc : { _id: id, title: id, phase: null, broken: true }
  })

  const resolved = steps.filter((s) => !s.broken)
  const broken = steps.filter((s) => s.broken)

  const phases = PHASE_ORDER.map((phaseKey) => ({
    phase: phaseKey,
    label: PHASE_LABELS[phaseKey],
    steps: resolved.filter((s) => s.phase === phaseKey),
  })).filter((p) => p.steps.length > 0)

  return {
    key: templateKey,
    label: template.label,
    totalSteps: template.generatorIds.length,
    deprecatedCount: resolved.filter((s) => s.deprecated).length,
    brokenIds: broken.map((s) => s._id),
    phases,
  }
}

export function getTemplateOptions() {
  return Object.entries(JOURNEY_TEMPLATES).map(([key, t]) => ({
    key,
    label: t.label,
  }))
}