import { fetchContent as f } from '@/app/utils/cms/fetchContent'
import { FETCH_DESIGNER_PORTAL_INDEX_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_INDEX_QUERY'
import PortalPageHeader from '@/app/components/portal/PortalPageHeader'
import ClientProjectList from '@/app/components/portal/ClientProjectList'
import UpcomingDeadlines from '@/app/components/portal/UpcomingDeadlines'
import PortalFooter from '@/app/components/portal/PortalFooter'

export default async function DesignerPortalIndex() {
  const clients = await f(Q)

  return (
  <main className='max-w-3xl   mx-auto px-3 lg:px-6 py-8 lg:py-16  w-full'>
      <PortalPageHeader
        variant="designer"
        label="Latz Web Design · Designer"
        title="Active Projects"
      />
      <ClientProjectList
        variant="designer"
        clients={clients}
        hrefBuilder={(clientSlug, projectSlug) => `/portal/designer/${clientSlug}/${projectSlug}`}
      />
      <UpcomingDeadlines clients={clients} variant="designer" />
      <PortalFooter />
    </main>
  )
}

export const revalidate = 10