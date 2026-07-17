export const FETCH_CLIENT_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    _id,
    name,
    "slug": slug.current,
    "projects": *[_type == "project" && client._ref == ^._id] | order(year desc, month desc) {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      clientPayment,
      designerPayment,
      "docCount": count(docs)
    },
    "notes": *[_type == "note" && references(^._id)] | order(_createdAt desc) {
      _id,
      title,
      sentAt,
      type,
      url,
      pinned,
      "clientName": client->name,
      "clientSlug": client->slug.current,
      "projectName": project->name,
      "projectSlug": project->slug.current,
      body[] {
        ...,
        _type == "image" => {
          ...,
          "url": asset->url
        }
      }
    }
  }
`