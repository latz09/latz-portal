// app/api/settings/quick-links/route.js
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import { sanityClient } from '@/app/utils/cms/sanityConnection'

const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/

async function requireInternal() {
  const session = await auth()
  if (session?.user?.role !== 'internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

async function getOrCreateSettingsId() {
  const existing = await sanityClient.fetch(`*[_type == "settings"][0]{_id}`)
  if (existing?._id) return existing._id
  const created = await writeClient.create({ _type: 'settings', quickLinks: [] })
  return created._id
}

export async function POST(req) {
  const unauthorized = await requireInternal()
  if (unauthorized) return unauthorized

  const { label, url } = await req.json()
  if (!label || !url) {
    return NextResponse.json({ error: 'label and url are required' }, { status: 400 })
  }

  let parsed
  try {
    parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const settingsId = await getOrCreateSettingsId()
  const newLink = { _key: crypto.randomUUID(), label, url: parsed.toString() }

  await writeClient
    .patch(settingsId)
    .setIfMissing({ quickLinks: [] })
    .append('quickLinks', [newLink])
    .commit()

  return NextResponse.json({ link: newLink })
}

export async function PATCH(req) {
  const unauthorized = await requireInternal()
  if (unauthorized) return unauthorized

  const { key, label, url } = await req.json()
  if (!key || !KEY_PATTERN.test(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }
  if (!label || !url) {
    return NextResponse.json({ error: 'label and url are required' }, { status: 400 })
  }

  let parsed
  try {
    parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error()
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const settingsId = await getOrCreateSettingsId()
  const updated = { _key: key, label, url: parsed.toString() }

  await writeClient
    .patch(settingsId)
    .set({ [`quickLinks[_key=="${key}"]`]: updated })
    .commit()

  return NextResponse.json({ link: updated })
}

export async function DELETE(req) {
  const unauthorized = await requireInternal()
  if (unauthorized) return unauthorized

  const { key } = await req.json()
  if (!key || !KEY_PATTERN.test(key)) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  const settingsId = await getOrCreateSettingsId()

  await writeClient
    .patch(settingsId)
    .unset([`quickLinks[_key=="${key}"]`])
    .commit()

  return NextResponse.json({ ok: true })
}