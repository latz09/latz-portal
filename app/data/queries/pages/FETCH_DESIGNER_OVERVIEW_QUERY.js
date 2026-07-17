export const FETCH_DESIGNER_OVERVIEW_QUERY = `
  *[_type == "project" && designerPayment.assigned == true] | order(year desc, month desc) {
    _id,
    name,
    "slug": slug.current,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    designerPayment,
    "deadlines": deadlines[audience match "designer"] {
      title,
      date,
      completed
    }
  }
`