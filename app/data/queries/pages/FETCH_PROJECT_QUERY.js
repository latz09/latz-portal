export const FETCH_PROJECT_QUERY = `
  *[_type == "project" && client->slug.current == $clientSlug && slug.current == $projectSlug][0] {
    "name": client->name,
    "slug": client->slug.current,
    "clientId": client->_id,
    "notes": *[_type == "note" && client->slug.current == $clientSlug] | order(_createdAt desc) {
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
    },
    "project": {
      "_key": _id,
      _id,
      name,
      "slug": slug.current,
      status,
      lostReason,
      month,
      year,
      estimateWeeksLow,
      estimateWeeksHigh,
      aiProjectLink,
      previewUrl,
      figmaUrl,
      studioUrl,
      vercelUrl,
      clientPayment,
      designerPayment,
      docs[] {
        label,
        filename,
        category,
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
        category,
        audience
      },
      journeySteps[] {
        _key,
        status,
        waitingOn,
        enteredWaitingAt,
        completedAt,
        dueDate,
        generators[]-> {
          _id,
          title,
          "slug": slug.current,
          link,
          icon,
          derivedFrom,
          deprecated,
          phase,
          isMilestone
        }
      }
    }
  }
`;