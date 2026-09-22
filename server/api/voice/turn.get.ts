export default defineEventHandler(() => {
  const urls = process.env.TURN_URLS
  if (!urls) return { urls: [] }
  return {
    urls: urls.split(',').map((u: string) => u.trim()).filter(Boolean),
    username: process.env.TURN_USERNAME,
    credential: process.env.TURN_PASSWORD,
  }
})