export const FETCH_CLIENT_PORTAL_QUERY = `
  *[_type == "project" && client->slug.current == $clientSlug && slug.current == $projectSlug][0] {
    "name": client->name,
    "slug": client->slug.current,
    "project": {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      docs[audience match "client"] {
        label,
        filename,
        audience
      }
    }
  }
`