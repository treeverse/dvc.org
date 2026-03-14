const { stringify } = require('querystring')

const { getRedirect } = require('../src/utils/shared/redirects')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = (req, res, next) => {
  const host = req.headers.host
  let pathname = req.baseUrl + req.path
  const [code, location] = getRedirect(host, pathname, {
    req,
    dev: !isProduction
  })

  // Disable trailing slash redirect for development mode.
  // Because it leads to infinite loops as Gatsby in dev mode redirects to urls with trailing slashes
  if (
    !isProduction &&
    location &&
    location.startsWith('/') &&
    pathname === `${location}/`
  ) {
    return next()
  }

  if (location) {
    // HTTP redirects
    let redirectLocation = location

    const queryStr = stringify(req.query)
    if (queryStr) {
      redirectLocation += '?' + queryStr
    }

    return res.redirect(code, redirectLocation)
  }

  next()
}
