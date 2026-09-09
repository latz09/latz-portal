import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { slugify, isClientSlugAvailable } from '@/app/utils/cms/slugHelpers'

export async function GET(request) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { searchParams } = new URL(request.url)
	const slug = slugify(searchParams.get('slug') || '')

	if (!slug) {
		return NextResponse.json({ slug: '', available: false })
	}

	const available = await isClientSlugAvailable(slug)
	return NextResponse.json({ slug, available })
}