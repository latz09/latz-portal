export const FETCH_DESIGNER_PORTAL_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    name,
    "slug": slug.current,
    "project": projects[slug.current == $projectSlug][0] {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      docs[audience match "designer"] {
        label,
        filename,
        audience
      }
    }
  }
`
