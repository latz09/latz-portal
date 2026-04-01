export const FETCH_PROJECT_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    name,
    "slug": slug.current,
    "project": projects[slug.current == $projectSlug][0] {
      name,
      "slug": slug.current,
      status,
      year,
      docs[] {
        label,
        filename,
        audience
      }
    }
  }
`