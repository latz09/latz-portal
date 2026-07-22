export const FETCH_ALL_JOURNEYS_QUERY = `
  *[_type == "project" && status in ["active", "on-hold", "potential"] && defined(journeySteps)] {
    _id,
    name,
    "slug": slug.current,
    "clientName": client->name,
    "clientSlug": client->slug.current,
    status,
    month,
    year,
    clientPayment,
    journeySteps[] {
      _key,
      status,
      enteredWaitingAt,
      completedAt,
      generators[]-> {
        _id,
        title,
        derivedFrom,
        phase
      }
    }
  }
`