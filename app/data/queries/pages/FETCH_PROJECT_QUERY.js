export const FETCH_PROJECT_QUERY = `
  *[_type == "client" && slug.current == $clientSlug][0] {
    _id,
    name,
    "slug": slug.current,
    "project": projects[slug.current == $projectSlug][0] {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      previewUrl,
      figmaUrl,
      studioUrl,
      vercelUrl,
      docs[] {
        label,
        filename,
        audience
      },
      deadlines[] | order(date asc) {
        title,
        description,
        date,
        audience
      }
    }
  }
`