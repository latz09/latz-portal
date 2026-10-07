// app/data/queries/pages/FETCH_SETTINGS_QUERY.js
export const FETCH_SETTINGS_QUERY = `
  *[_type == "settings"][0]{
    _id,
    quickLinks[]{
      _key,
      label,
      url
    }
  }
`