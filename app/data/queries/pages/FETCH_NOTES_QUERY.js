export const FETCH_NOTES_QUERY = `
  *[_type == "note"] | order(_createdAt desc) {
    _id,
    title,
    type,
    url,
    pinned,
    sentAt,
    completed,
    completedAt,
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
`