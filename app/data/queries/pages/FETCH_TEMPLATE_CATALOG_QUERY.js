export const FETCH_TEMPLATE_CATALOG_QUERY = `
*[_type == "generatorSchema"]{
  _id,
  title,
  "slug": slug.current,
  phase,
  link,
  icon,
  derivedFrom,
  assignedTo,
  isMilestone,
  deprecated
}
`