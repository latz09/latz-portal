export const FETCH_DESIGNER_OVERVIEW_QUERY = `
  *[_type == "project" && designerPayment.assigned == true] | order(year desc, month desc) {
    _id,
    name,
    status,
    "slug": slug.current,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    designerPayment,
    "deadlines": deadlines[audience match "designer" && completed != true] {
      _key,
      title,
      date,
      completed
    },
    "journeyMilestones": journeySteps[
      defined(dueDate) &&
      status != "done" &&
      generators[0]->isMilestone == true &&
      coalesce(phaseOverride, generators[0]->phase) in ["c-kickoff", "d-design"]
    ] {
      _key,
      "date": dueDate,
      status,
      waitingOn,
      "title": coalesce(titleOverride, generators[0]->title),
      "phase": coalesce(phaseOverride, generators[0]->phase)
    }
  }
`