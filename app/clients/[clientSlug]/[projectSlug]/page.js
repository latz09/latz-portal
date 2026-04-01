import { fetchContent as f } from '@/app/utils/cms/fetchContent'
import { FETCH_PROJECT_QUERY as Q } from '@/app/data/queries/pages/FETCH_PROJECT_QUERY'
import Link from 'next/link'

const audienceColors = {
  internal: 'bg-[#18a1ad]/20 text-[#18a1ad]',
  designer: 'bg-purple-500/20 text-purple-400',
  client:   'bg-yellow-500/20 text-yellow-400',
}

export default async function ProjectPage({ params }) {
  const { clientSlug, projectSlug } = await params
  const data = await f(Q, { clientSlug, projectSlug })

  const { name: clientName, project } = data

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">

      <div className="mb-12">
        <Link
          href={`/clients/${clientSlug}`}
          className="font-mono text-xs text-[#18a1ad] tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          ← {clientName}
        </Link>
        <div className="flex items-center gap-4 mt-4">
          <h1 className="text-4xl font-semibold">{project.name}</h1>
          <span className="font-mono text-xs text-white/40">
            {project.month}/{project.year}
          </span>
        </div>
      </div>

      {/* DOCS */}
      <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-4">
        Documents
      </p>
      <div className="flex flex-col gap-3">
        {project.docs.map(doc => (
          <a
            key={doc.filename}
            href={`/clients/${project.year}/${clientSlug}/${projectSlug}/${doc.filename}`}
            target="_blank"
            className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors"
          >
            <span className="font-medium">{doc.label}</span>
            <div className="flex gap-2">
              {doc.audience.map(a => (
                <span
                  key={a}
                  className={`font-mono text-xs px-2 py-0.5 rounded-full ${audienceColors[a]}`}
                >
                  {a}
                </span>
              ))}
            </div>
          </a>
        ))}
      </div>

      {/* PORTAL LINKS */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <p className="font-mono text-xs text-white/30 tracking-widest uppercase mb-4">
          Portal Links
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">
                client
              </span>
              <span className="text-sm text-white/40 font-mono">
                /portal/client/{clientSlug}/{projectSlug}
              </span>
            </div>
            <a
              href={`/portal/client/${clientSlug}/${projectSlug}`}
              target="_blank"
              className="font-mono text-xs text-[#18a1ad] hover:opacity-70 transition-opacity"
            >
              Open →
            </a>
          </div>
          {/* <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                designer
              </span>
              <span className="text-sm text-white/40 font-mono">
                /portal/designer/{clientSlug}/{projectSlug}
              </span>
            </div>
            <a
              href={`/portal/designer/${clientSlug}/${projectSlug}`}
              target="_blank"
              className="font-mono text-xs text-purple-400 hover:opacity-70 transition-opacity"
            >
              Open →
            </a>
          </div> */}
        </div>
      </div>

    </main>
  )
}

export const revalidate = 10