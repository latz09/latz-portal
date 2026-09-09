import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { slugify, isProjectSlugAvailable } from '@/app/utils/cms/slugHelpers'

export async function GET(request) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const slug = slugify(searchParams.get('slug') || '')
	const clientId = searchParams.get('clientId') || ''

	if (!slug) {
		return NextResponse.json({ slug: '', available: false })
	}

	if (!clientId) {
		return NextResponse.json({ slug, available: true })
	}

	const available = await isProjectSlugAvailable(slug, clientId)
	return NextResponse.json({ slug, available })
}