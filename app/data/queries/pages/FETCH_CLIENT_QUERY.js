export const FETCH_CLIENT_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    name,
    "slug": slug.current,
    projects[] {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      "docCount": count(docs)
    }
  }
`