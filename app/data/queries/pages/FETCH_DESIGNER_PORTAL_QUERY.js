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
      previewUrl,
      figmaUrl,
      docs[] {
        label,
        filename,
        audience
      },
      deadlines[] | order(date asc) {
        _key,
        title,
        description,
        date,
        audience,
        completed,
        completedAt
      },
      inspiration[] {
        "url": image.asset->url,
        caption,
        category
      },
      resources[] {
        label,
        url,
        type,
        audience
      }
    }
  }
`