export const FETCH_ALL_PROJECTS_QUERY = `
  *[_type == "project"] | order(year desc, month desc) {
    _id,
    name,
    "slug": slug.current,
    status,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    clientPayment,
    designerPayment,
     "journeyMilestones": journeySteps[
        defined(dueDate) && status != "done" && generators[0]->isMilestone == true
      ] {
        _key,
        "date": dueDate,
        "title": generators[0]->title
      },
    deadlines[] {
      title,
      date,
      completed
    }
  }
`