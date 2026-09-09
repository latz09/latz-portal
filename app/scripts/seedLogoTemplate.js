// scripts/seedLogoTemplate.js
// Run once: node --env-file=.env.local scripts/seedLogoTemplate.js
// Requires SANITY_WRITE_TOKEN — check the exact var name in app/utils/cms/writeClient.js and match it here if different.

const { createClient } = require('@sanity/client')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-12-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})

function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const STEPS = [
  { title: 'Logo Discovery Call Follow-Up', phase: 'a-outreach' },
  { title: 'Logo Proposal Sent', phase: 'b-close', isMilestone: true },
  { title: 'Deposit', phase: 'b-close', isMilestone: true, derivedFrom: 'deposit' },
  { title: 'Brand Discovery Questionnaire', phase: 'c-kickoff' },
  { title: 'Initial Concepts Presented', phase: 'd-design', isMilestone: true },
  { title: 'Concept Feedback Round 1', phase: 'd-design' },
  { title: 'Revisions', phase: 'd-design' },
  { title: 'Final Concept Approved', phase: 'd-design', isMilestone: true },
  { title: 'File Prep & Export', phase: 'e-build' },
  { title: 'Brand Style One-Pager', phase: 'f-prelaunch' },
  { title: 'Final Files Delivered', phase: 'g-launch', isMilestone: true },
  { title: 'Final Invoice', phase: 'g-launch', isMilestone: true, derivedFrom: 'final' },
  { title: 'Review Request', phase: 'h-postlaunch' },
]

async function seed() {
  if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
    throw new Error('NEXT_PUBLIC_SANITY_PROJECT_ID is not set — env file not loaded?')
  }
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error('SANITY_WRITE_TOKEN is not set — check the var name in writeClient.js')
  }

  const created = []

  for (const step of STEPS) {
    const doc = {
      _type: 'generatorSchema',
      title: step.title,
      slug: { _type: 'slug', current: slugify(step.title) },
      phase: step.phase,
      derivedFrom: step.derivedFrom || 'none',
      assignedTo: 'internal',
      isMilestone: Boolean(step.isMilestone),
      deprecated: false,
    }

    const result = await client.create(doc)
    created.push({ title: step.title, id: result._id })
    console.log(`Created: ${step.title} -> ${result._id}`)
  }

  console.log('\n--- Paste into JOURNEY_TEMPLATES.logo.generatorIds, in this order ---\n')
  created.forEach((c) => console.log(`  '${c.id}', // ${c.title}`))
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})