export const FETCH_CLIENT_BASIC_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    _id,
    name,
    "slug": slug.current
  }
`