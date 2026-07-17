import { TbChevronRight } from 'react-icons/tb'
import Card from '@/app/components/ui/Card'
import { getDeadlineStatus } from './deadlineUtils'

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

// Soonest non-completed upcoming/overdue deadline date for one project.
function getNextDeadlineDate(deadlines) {
  let nextDate = null
  deadlines?.forEach((d) => {
    if (d.completed) return
    const status = getDeadlineStatus(d.date)
    if (!(status.isPast || status.isUpcoming)) return
    if (!nextDate || status.date < nextDate) nextDate = status.date
  })
  return nextDate
}

// Soonest across all of a client's projects.
function getClientNextDate(client) {
  let nextDate = null
  client.projects?.forEach((project) => {
    const projectNext = getNextDeadlineDate(project.deadlines)
    if (projectNext && (!nextDate || projectNext < nextDate)) nextDate = projectNext
  })
  return nextDate
}

// Soonest first; anything with no upcoming date sinks to the bottom
// instead of breaking the sort.
function sortByNextDate(items, getDate) {
  return [...items].sort((a, b) => {
    const aDate = getDate(a)
    const bDate = getDate(b)
    if (!aDate && !bDate) return 0
    if (!aDate) return 1
    if (!bDate) return -1
    return aDate - bDate
  })
}

export default function ClientProjectList({ variant, clients, hrefBuilder }) {
  const s = variantStyles[variant]
  const sortedClients = sortByNextDate(clients, getClientNextDate)

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      {sortedClients.map(client => {
        const sortedProjects = sortByNextDate(client.projects, (p) =>
          getNextDeadlineDate(p.deadlines),
        )

        return (
          <div key={client.slug}>
            <p className="font-mono text-sm lg:text-base text-white tracking-widest uppercase mb-3">
              {client.name}
            </p>
            <div className="inline-flex flex-col gap-3 w-full mx-auto pl-2 lg:pl-4">
              {sortedProjects.map(project => (
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
        )
      })}
    </div>
  )
}