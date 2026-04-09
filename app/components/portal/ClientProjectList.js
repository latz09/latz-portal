import Link from 'next/link'

const variantStyles = {
  internal: { accent: 'text-teal' },
  designer: { accent: 'text-purple' },
}

const statusColors = {
  active: 'text-teal',
  complete: 'text-white/70 italic line-through',
  'on-hold': 'text-warning',
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ClientProjectList({ variant, clients, hrefBuilder }) {
  const s = variantStyles[variant]

  return (
    <div className="flex flex-col gap-8">
      {clients.map(client => (
        <div key={client.slug}>
          <p className="font-mono text-sm lg:text-base text-white tracking-widest uppercase mb-3">
            {client.name}
          </p>
          <div className="inline-flex flex-col gap-3 w-full mx-auto pl-2 lg:pl-4">
            {client.projects.map(project => (
              <Link
                key={project.slug}
                href={hrefBuilder(client.slug, project.slug)}
                className="w-full flex flex-col gap-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-6 py-4 transition-colors"
              >
                <div className="flex justify-between">
                  <span className="font-medium lg:text-lg text-white">{project.name}</span>
                  <span className={`font-mono text-xs lg:text-sm font-bold uppercase ${statusColors[project.status]}`}>
                    {project.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs lg:text-sm text-white/70">
                    {monthNames[project.month - 1]} {project.year}
                  </span>
                  <span className={`font-mono text-xs lg:text-sm ${s.accent}`}>
                    {project.docCount} documents
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}