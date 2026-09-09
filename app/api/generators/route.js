import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { fetchContent as f } from '@/app/utils/cms/fetchContent'
import { FETCH_GENERATOR_CATALOG_QUERY as Q } from '@/app/data/queries/pages/FETCH_GENERATOR_CATALOG_QUERY'

export async function GET() {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const generators = await f(Q)
	return NextResponse.json(generators)
}