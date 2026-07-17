export const FETCH_DESIGNER_PORTAL_INDEX_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "projects": *[
      _type == "project" &&
      client._ref == ^._id &&
      status == "active" &&
      count(deadlines[audience match "designer" && completed != true]) > 0
    ] | order(year asc, month asc) {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      "docCount": count(docs[audience match "designer"]),
      "deadlines": deadlines[audience match "designer"] | order(date asc) {
        _key,
        title,
        date,
        description,
        completed,
        completedAt
      }
    }
  }[count(projects) > 0]
`