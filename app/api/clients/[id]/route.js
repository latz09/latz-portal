import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { writeClient } from '@/app/utils/cms/writeClient'

export async function PATCH(request, { params }) {
	const session = await auth()
	if (session?.user?.role !== 'internal') {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
	}

	const { id } = await params
	const { name } = await request.json()

	if (!name?.trim()) {
		return NextResponse.json({ error: 'Client name is required' }, { status: 400 })
	}

	try {
		await writeClient.patch(id).set({ name: name.trim() }).commit()
		return NextResponse.json({ success: true })
	} catch (err) {
		console.error('Failed to update client:', err)
		return NextResponse.json({ error: 'Failed to update client' }, { status: 500 })
	}
}