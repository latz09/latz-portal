export const FETCH_DESIGNER_PORTAL_INDEX_QUERY = `
  *[_type == "client"] | order(name asc) {
    name,
    "slug": slug.current,
    "projects": *[
      _type == "project" &&
      client._ref == ^._id &&
      status == "active" &&
      (
        count(deadlines[audience match "designer" && completed != true]) > 0 ||
        count(journeySteps[
          (defined(dueDate) || status == "waiting") &&
          status != "done" &&
          generators[0]->isMilestone == true &&
          generators[0]->phase in ["c-kickoff", "d-design"]
        ]) > 0
      )
    ] | order(year asc, month asc) {
      name,
      "slug": slug.current,
      status,
      month,
      year,
      designerPayment,
      "docCount": count(docs[audience match "designer"]),
      "deadlines": deadlines[audience match "designer" && completed != true] | order(date asc) {
        _key,
        title,
        date,
        description,
        completed,
        completedAt
      },
      "journeyMilestones": journeySteps[
        (defined(dueDate) || status == "waiting") &&
        status != "done" &&
        generators[0]->isMilestone == true &&
        generators[0]->phase in ["c-kickoff", "d-design"]
      ] {
        _key,
        "date": dueDate,
        status,
        waitingOn,
        "title": generators[0]->title,
        "phase": generators[0]->phase
      }
    }
  }[count(projects) > 0]
`