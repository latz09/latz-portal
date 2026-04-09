import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const session = await auth()
  const role = session?.user?.role

  if (role === 'internal') redirect('/dashboard')
  if (role === 'designer') redirect('/portal/designer')
  redirect('/login')
}