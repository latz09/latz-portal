export const FETCH_CLIENTS_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "activeProjects": count(projects[status == "active"]),
    "totalProjects": count(projects)
  }
`