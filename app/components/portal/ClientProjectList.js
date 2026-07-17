import { TbChevronRight } from 'react-icons/tb'
import Card from '@/app/components/ui/Card'

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
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {clients.map(client => (
        <div key={client.slug}>
          <p className="font-mono text-sm lg:text-base text-white tracking-widest uppercase mb-3">
            {client.name}
          </p>
          <div className="inline-flex flex-col gap-3 w-full mx-auto pl-2 lg:pl-4">
            {client.projects.map(project => (
              <Card
                key={project.slug}
                href={hrefBuilder(client.slug, project.slug)}
                className="group w-full flex flex-col gap-4"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium lg:text-lg text-white">{project.name}</span>
                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-xs lg:text-sm font-bold uppercase ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                    <TbChevronRight className="lg:text-lg text-purple opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs lg:text-sm text-white/70">
                    {monthNames[project.month - 1]} {project.year}
                  </span>
                  <span className={`font-mono text-xs lg:text-sm ${s.accent}`}>
                    {project.docCount} documents
                  </span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}