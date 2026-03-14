import fs from 'fs'

import path from 'upath'

async function crawlPageData(dataPath, onPageData) {
  const stat = fs.statSync(dataPath)
  if (stat.isDirectory()) {
    const paths = fs.readdirSync(dataPath)
    return Promise.all(
      paths.map(name => crawlPageData(path.join(dataPath, name), onPageData))
    )
  } else if (path.basename(dataPath) === 'page-data.json') {
    return await onPageData(dataPath)
  }
}

async function removeFile(filePath) {
  return new Promise((resolve, reject) =>
    fs.unlink(filePath, err => {
      if (err) {
        console.error(`Couldn't remove stale page data at "${filePath}"!`)
        reject(err)
      } else {
        console.log(`Removed stale page data at "${filePath}"`)
        resolve()
      }
    })
  )
}

export async function onPostBuild({ graphql }) {
  // Remove stale page-data from cache in production

  // Bail out early if we're in dev mode.
  // Doing this in dev would cull an existing build cache to the dev subset.
  if (process.env.NODE_ENV === 'development') return null

  const query = await graphql(`
    {
      allSitePage {
        nodes {
          path
        }
      }
    }
  `)

  if (query.errors)
    throw new Error({
      message: 'Querying for page paths in cache cleaning failed!',
      errors: query.errors
    })

  // Remove trailing slashes that find their way into the page data.
  // This is a little weird, but useful to truly make the pages slash-agnostic
  const pagePathSet = new Set(
    query.data.allSitePage.nodes.map(({ path }) => {
      const lastIndex = path.length - 1
      return path[lastIndex] === '/' ? path.slice(0, lastIndex) : path
    })
  )

  return crawlPageData('./public/page-data', pageDataPath => {
    const cachedPagePath = /public\/page-data(.*)\/page-data.json/.exec(
      pageDataPath
    )[1]
    // Delete the page-data file if the cached page isn't actually present.
    // Index is a special case, as its path is '/' and dir is '/index'.
    return pagePathSet.has(cachedPagePath)
      ? null
      : cachedPagePath === '/index'
        ? null
        : removeFile(pageDataPath)
  })
}
