export const FETCH_DESIGNER_PORTAL_QUERY = `
  *[_type == "project" && client->slug.current == $clientSlug && slug.current == $projectSlug][0] {
    "name": client->name,
    "slug": client->slug.current,
    "project": {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      designerPayment,
      previewUrl,
      figmaUrl,
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
      "journeyMilestones": journeySteps[
        (defined(dueDate) || status == "waiting") &&
        generators[0]->isMilestone == true &&
        coalesce(phaseOverride, generators[0]->phase) in ["c-kickoff", "d-design"]
      ] {
        _key,
        "date": dueDate,
        status,
        waitingOn,
        "title": coalesce(titleOverride, generators[0]->title),
        "phase": coalesce(phaseOverride, generators[0]->phase)
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
      }
    }
  }
`