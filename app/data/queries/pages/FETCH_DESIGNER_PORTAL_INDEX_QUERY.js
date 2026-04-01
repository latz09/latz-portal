export const FETCH_DESIGNER_PORTAL_INDEX_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "projects": projects[status == "active"] {
      name,
      "slug": slug.current,
      month,
      year
    }
  }[count(projects) > 0]
`