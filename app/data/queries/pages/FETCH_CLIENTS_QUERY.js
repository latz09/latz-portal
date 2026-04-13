export const FETCH_CLIENTS_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "activeProjects": count(projects[status == "active"]),
    "onHoldProjects": count(projects[status == "on-hold"]),
    "potentialProjects": count(projects[status == "potential"]),
    "completeProjects": count(projects[status == "complete"]),
    "totalProjects": count(projects),
    "projects": projects[] {
      name,
      "slug": slug.current,
      month,
      year,
      "deadlines": deadlines[] | order(date asc) {
        _key,
        title,
        date,
        description,
        audience,
        completed,
        completedAt
      }
    }
  }
`