export const FETCH_PROJECT_QUERY = `
  *[_type == "project" && client->slug.current == $clientSlug && slug.current == $projectSlug][0] {
    "name": client->name,
    "slug": client->slug.current,
    "project": {
      "_key": _id,
      _id,
      name,
      "slug": slug.current,
      status,
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
      },
     journeySteps[] {
        _key,
        status,
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
`