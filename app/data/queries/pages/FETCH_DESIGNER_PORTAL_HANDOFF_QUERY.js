export const FETCH_DESIGNER_PORTAL_HANDOFF_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "projects": projects[
      status == "active" &&
      count(deadlines[audience match "designer"]) > 0 &&
      count(deadlines[audience match "designer" && completed != true]) == 0
    ] | order(year asc, month asc) {
      name,
      "slug": slug.current,
      status,
      month,
      year
    }
  }[count(projects) > 0]
`