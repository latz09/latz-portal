export const FETCH_CLIENT_PORTAL_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    name,
    "slug": slug.current,
    "project": projects[slug.current == $projectSlug][0] {
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