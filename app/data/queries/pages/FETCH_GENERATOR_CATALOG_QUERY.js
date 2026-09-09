export const FETCH_GENERATOR_CATALOG_QUERY = `
  *[_type == "generatorSchema" && deprecated != true] | order(title asc) {
    _id,
    title,
    phase,
    isMilestone,
    derivedFrom
  }
`