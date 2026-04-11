import { fetchContent as f } from '@/app/utils/cms/fetchContent'
import { FETCH_CLIENTS_QUERY as Q } from '@/app/data/queries/pages/FETCH_CLIENTS_QUERY'

export async function GET() {
  const clients = await f(Q)
  return Response.json(clients)
}