export const FETCH_DESIGNER_PORTAL_INDEX_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "projects": projects[status == "active"] | order(year asc, month asc) {
      name,
      "slug": slug.current,
      month,
      year,
      "deadlines": deadlines[audience match "designer"] | order(date asc) {
        title,
        date,
        description
      }
    }
  }[count(projects) > 0]
`