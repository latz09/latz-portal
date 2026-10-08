import { fetchContent as f } from '@/app/utils/cms/fetchContent';import { FETCH_TEMPLATE_CATALOG_QUERY } from '@/app/data/queries/pages/FETCH_TEMPLATE_CATALOG_QUERY'
import { resolveTemplateCatalog, getTemplateOptions } from '@/app/utils/journeyTemplateCatalog'
import TemplateBoard from '@/app/components/templates/TemplateBoard'

export const revalidate = 10

export default async function JourneyTemplatesPage() {
  const generators = await f(FETCH_TEMPLATE_CATALOG_QUERY)
  const templateOptions = getTemplateOptions()

  const catalogs = Object.fromEntries(
    templateOptions.map(({ key }) => [key, resolveTemplateCatalog(key, generators)])
  )

  return (
    <div className="max-w-[120rem] w-full mx-auto px-3 lg:px-8 py-3 lg:py-6 2xl:py-12">
      <h1 className="font-mono text-sm tracking-widest uppercase text-white/40 mb-6">
        Journey Templates
      </h1>
      <TemplateBoard templateOptions={templateOptions} catalogs={catalogs} />
    </div>
  )
}