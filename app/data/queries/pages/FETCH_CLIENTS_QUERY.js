export const FETCH_CLIENTS_QUERY = `
  *[_type == "client"] | order(name asc) {
    _id,
    name,
    "slug": slug.current,
    "activeProjects": count(*[_type == "project" && client._ref == ^._id && status == "active"]),
    "onHoldProjects": count(*[_type == "project" && client._ref == ^._id && status == "on-hold"]),
    "potentialProjects": count(*[_type == "project" && client._ref == ^._id && status == "potential"]),
    "onIceProjects": count(*[_type == "project" && client._ref == ^._id && status == "on-ice"]),
    "completeProjects": count(*[_type == "project" && client._ref == ^._id && status == "complete"]),
    "totalProjects": count(*[_type == "project" && client._ref == ^._id]),
    "projects": *[_type == "project" && client._ref == ^._id] {
      name,
      "slug": slug.current,
      month,
      year,
      clientPayment,
      designerPayment,
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