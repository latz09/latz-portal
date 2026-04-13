import { auth } from '@/auth';
import { writeClient } from '@/app/utils/cms/writeClient';

export async function POST(req, { params }) {
  const session = await auth();
  if (!session || session.user.role !== 'internal') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await writeClient
    .patch(id)
    .set({ sentAt: new Date().toISOString() })
    .commit();

  return Response.json({ success: true });
}