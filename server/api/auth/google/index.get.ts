export default defineEventHandler(async (event) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) {
    throw createError({ statusCode: 500, message: 'Google OAuth not configured' })
  }
  const query = getQuery(event)
  const redirect = typeof query.redirect === 'string' && query.redirect.startsWith('/') && !query.redirect.startsWith('//')
    ? query.redirect
    : '/home'
  const redirectUri = `${getRequestProtocol(event)}://${getRequestHost(event)}/api/auth/google/callback`
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid+email+profile&state=${encodeURIComponent(redirect)}`
  return sendRedirect(event, url)
})
