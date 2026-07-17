export const FETCH_ALL_PROJECTS_QUERY = `
  *[_type == "project"] | order(year desc, month desc) {
    _id,
    name,
    "slug": slug.current,
    status,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    clientPayment,
    designerPayment,
    deadlines[] {
      title,
      date,
      completed
    }
  }
`