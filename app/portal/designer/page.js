import { fetchContent as f } from '@/app/utils/cms/fetchContent'
import { FETCH_DESIGNER_PORTAL_INDEX_QUERY as Q } from '@/app/data/queries/pages/FETCH_DESIGNER_PORTAL_INDEX_QUERY'
import Link from 'next/link'

export default async function DesignerPortalIndex() {
  const clients = await f(Q)

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">

      <div className="mb-12">
        <p className="font-mono text-xs text-purple-400 tracking-widest uppercase mb-2">
          Latz Web Design · Designer
        </p>
        <h1 className="text-4xl font-semibold">Active Projects</h1>
      </div>

      <div className="flex flex-col gap-8">
        {clients.map(client => (
          <div key={client.slug}>
            <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-3">
              {client.name}
            </p>
            <div className="flex flex-col gap-3">
              {client.projects.map(project => (
                <Link
                  key={project.slug}
                  href={`/portal/designer/${client.slug}/${project.slug}`}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors"
                >
                  <span className="font-medium">{project.name}</span>
                  <span className="font-mono text-xs text-white/40">
                    {project.month}/{project.year}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 pt-8 border-t border-white/10">
        <p className="font-mono text-xs text-white/20">
          Latz Web Design · jordan@latzwebdesign.com
        </p>
      </div>

    </main>
  )
}

export const revalidate = 10