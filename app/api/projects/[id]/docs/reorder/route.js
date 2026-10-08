// app/api/projects/[id]/docs/reorder/route.js
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'
import { sanityClient } from '@/app/utils/cms/sanityConnection'

const KEY_PATTERN = /^[a-zA-Z0-9_-]+$/

export async function PATCH(req, { params }) {
  const session = await auth()
  if (session?.user?.role !== 'internal') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { orderedKeys } = await req.json()

  if (!Array.isArray(orderedKeys) || orderedKeys.length === 0) {
    return NextResponse.json({ error: 'orderedKeys is required' }, { status: 400 })
  }
  if (!orderedKeys.every((k) => typeof k === 'string' && KEY_PATTERN.test(k))) {
    return NextResponse.json({ error: 'Invalid key in orderedKeys' }, { status: 400 })
  }

  const project = await sanityClient.fetch(
    `*[_type == "project" && _id == $id][0]{ docs }`,
    { id }
  )
  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  }

  const currentDocs = project.docs || []
  const byKey = new Map(currentDocs.map((d) => [d._key, d]))

  // orderedKeys must be exactly the current doc keys, just reordered —
  // guards against a stale client payload silently dropping or
  // fabricating docs via this route.
  const currentKeys = currentDocs.map((d) => d._key)
  const sameSet =
    orderedKeys.length === currentKeys.length &&
    orderedKeys.every((k) => byKey.has(k))
  if (!sameSet) {
    return NextResponse.json(
      { error: 'orderedKeys must match the project\'s current document set' },
      { status: 400 }
    )
  }

  const reorderedDocs = orderedKeys.map((k) => byKey.get(k))

  await writeClient.patch(id).set({ docs: reorderedDocs }).commit()

  return NextResponse.json({ docs: reorderedDocs })
}