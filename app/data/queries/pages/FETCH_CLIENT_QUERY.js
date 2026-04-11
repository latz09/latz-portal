export const FETCH_CLIENT_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    _id,
    name,
    "slug": slug.current,
    projects[] {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      "docCount": count(docs)
    },
    "notes": *[_type == "note" && references(^._id)] | order(_createdAt desc) {
      _id,
      title,
      type,
      url,
      pinned,
      "clientName": client->name,
      "clientSlug": client->slug.current,
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