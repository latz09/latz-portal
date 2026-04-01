import { sanityClient } from "./sanityConnection"

export async function fetchContent(query, params = {}) {
  try {
    const data = await sanityClient.fetch(query, params)
    return data
  } catch (error) {
    console.error('Actual error:', error.message)
    console.error('Full error:', error)
    throw new Error('Failed to fetch data')
  }
}