import fs from 'fs'
import path from 'path'
import { JOURNEY_TEMPLATES } from '@/app/data/journeyTemplates'
import { PHASE_ORDER, PHASE_LABELS } from '@/app/utils/journeyHelpers'

const EXAMPLES_DIR = path.join(process.cwd(), 'public', 'examples')

function camelCaseFilename(title) {
  if (!title) return null
  const words = title.trim().split(/\s+/).map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
  return words
    .map((w, i) => {
      if (!w) return ''
      return i === 0 ? w.charAt(0).toLowerCase() + w.slice(1) : w.charAt(0).toUpperCase() + w.slice(1)
    })
    .join('')
}

function resolveExample(title) {
  const name = camelCaseFilename(title)
  if (!name) return { exampleFilename: null, exampleUrl: null }
  const filename = `${name}.html`
  const exists = fs.existsSync(path.join(EXAMPLES_DIR, filename))
  return {
    exampleFilename: filename,
    exampleUrl: exists ? `/examples/${filename}` : null,
  }
}

export function resolveTemplateCatalog(templateKey, generators) {
  const template = JOURNEY_TEMPLATES[templateKey]
  if (!template) return null

  const byId = new Map(generators.map((g) => [g._id, g]))

  const steps = template.generatorIds.map((id) => {
    const doc = byId.get(id)
    return doc ? doc : { _id: id, title: id, phase: null, broken: true }
  })

  const resolved = steps
    .filter((s) => !s.broken)
    .map((s) => ({ ...s, ...resolveExample(s.title) }))
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