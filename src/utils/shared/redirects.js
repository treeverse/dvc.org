/* eslint-env node */

const { navigate } = require('gatsby')

const redirects = require('../../../redirects')

const { structure, findChildWithSource } = require('./sidebar')

const buildSidebarRedirects = (list, redirects = []) => {
  list.forEach(item => {
    if (!item.source && item.children) {
      const redirectToChild = findChildWithSource(item)

      redirects.push(`^${item.path}/?$ ${redirectToChild.path} 307`)
    }

    if (Array.isArray(item.children)) {
      buildSidebarRedirects(item.children, redirects)
    }
  })

  return redirects
}

const processRedirectString = redirectString => {
  const redirectParts = redirectString.split(/\s+/g)
  const matchPathname = /^\^?\//.test(redirectParts[0])
  const regex = new RegExp(redirectParts[0])

  return {
    regex,
    matchPathname,
    replace: redirectParts[1],
    code: Number(redirectParts[2] || 301)
  }
}

const getRedirects = (() => {
  let allRedirects

  return () => {
    if (!allRedirects) {
      allRedirects = [...redirects, ...buildSidebarRedirects(structure)].map(
        processRedirectString
      )
    }

    return allRedirects
  }
})()

const matchRedirectList = (host, pathname) => {
  const wholeUrl = `https://${host}${pathname}`

  for (const { matchPathname, regex, replace, code } of getRedirects()) {
    const matchTarget = matchPathname ? pathname : wholeUrl
    if (regex.test(matchTarget)) {
      return [code, matchTarget.replace(regex, replace).replace(/^\/+/, '/')]
    }
  }

  return []
}

const getRedirect = (host, pathname, { req, dev } = {}) => {
  const httpsRedirect = req != null && !dev && !/^localhost(:\d+)?$/.test(host)
  if (httpsRedirect && req.headers['x-forwarded-proto'] !== 'https') {
    return [301, `https://${host.replace(/^www\./, '')}${req.url}`]
  }

  return matchRedirectList(host, pathname)
}

const handleFrontRedirect = (host, pathname, clickEvent) => {
  let [, redirectUrl] = getRedirect(host, pathname)

  if (redirectUrl) {
    if (clickEvent) {
      clickEvent.preventDefault()
    }

    if (redirectUrl.startsWith('/')) {
      redirectUrl = redirectUrl + window.location.search

      // If it's trailing slash redirect we should save hash in the url
      if (pathname === `${redirectUrl}/`) {
        redirectUrl = redirectUrl + window.location.hash
      }
    }

    navigate(redirectUrl)
  }
}

exports.buildSidebarRedirects = buildSidebarRedirects
exports.processRedirectString = processRedirectString
exports.getRedirect = getRedirect
exports.handleFrontRedirect = handleFrontRedirect
