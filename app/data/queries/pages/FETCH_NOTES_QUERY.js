export const FETCH_NOTES_QUERY = `
  *[_type == "note"] | order(_createdAt desc) {
    _id,
    title,
    type,
    url,
    pinned,
    backBurner,
    sentAt,
    completed,
    completedAt,
    "clientId": client->_id,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    "projectId": project->_id,
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