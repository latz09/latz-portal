import Link from 'next/link'

const variantStyles = {
  internal: { color: 'text-teal',   date: 'text-teal'   },
  designer: { color: 'text-purple', date: 'text-purple' },
}

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ClientProjectList({ variant, clients, hrefBuilder }) {
  const s = variantStyles[variant]

  return (
    <div className="flex flex-col gap-8">
      {clients.map(client => (
        <div key={client.slug}>
          <p className={`font-mono text-sm text-white tracking-widest uppercase mb-3`}>
            {client.name}
          </p>
          <div className="inline-flex flex-col gap-3 w-full mx-auto pl-2 lg:pl-4">
            {client.projects.map(project => (
              <Link
                key={project.slug}
                href={hrefBuilder(client.slug, project.slug)}
                className="w-full grid bg-white/5 gap-0.5 hover:bg-dark border border-white/10 rounded px-6 py-4 transition-colors"
              >
                <h3 className="font-medium text-lg text-white pb-1">{project.name}</h3>
                <span className={`font-mono text ${s.date} opacity-80 ml-2`}>
                  Started {monthNames[project.month - 1]} {project.year}
                </span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}