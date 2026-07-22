import { sanityClient } from "./sanityConnection"

export async function fetchContent(query, params = {}) {
  try {
    const raw = await fetch(
  'https://r1xpenh1.api.sanity.io/v2024-12-01/data/query/production?perspective=published&query=count(*%5B_type%3D%3D%22generatorSchema%22%5D)'
).then(r => r.json())
console.log('RAW NODE FETCH →', raw)
    const probe = await sanityClient.fetch(
      `count(*[_type=="generatorSchema"])`,
      {},
      { cache: 'no-store' }
    )
    console.log('PROBE COUNT →', probe)
    console.log('FULL CFG →', JSON.stringify(sanityClient.config()))

    const data = await sanityClient.fetch(query, params, { cache: 'no-store' })
    return data
  } catch (error) {
    console.error('Actual error:', error.message)
    console.error('Full error:', error)
    throw new Error('Failed to fetch data')
  }
}