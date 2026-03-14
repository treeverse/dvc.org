const SLUG_REGEXP = /\s+{#([a-z0-9-]*[a-z0-9]+)}\s*$/

const path = require('path')

const extractSlugFromTitle = (title, slugger) => {
  // extracts expressions like {#too-many-files} from the end of a title
  const meta = title.match(SLUG_REGEXP)

  if (meta) {
    return [title.substring(0, meta.index), meta[1]]
  }
  return [title, slugger.slug(title)]
}

const parseHeadings = (text, slugger) => {
  const headingRegex = /\n(## \s*)(.*)/g
  const matches = []
  let match
  do {
    match = headingRegex.exec(text)
    if (match) {
      const [title, slug] = extractSlugFromTitle(match[2], slugger)
      matches.push({
        text: title,
        slug: slug
      })
    }
  } while (match)

  slugger.reset()
  return matches
}

const createPages = async (
  { graphql, actions },
  { defaultTemplate, getTemplate, disable, docsPrefix }
) => {
  if (disable) return

  const { default: GithubSlugger } = await import('github-slugger')
  const slugger = new GithubSlugger()

  const docsResponse = await graphql(`
    {
      docs: allDocsPage(limit: 9999) {
        edges {
          node {
            id
            slug
            template
            parent {
              ... on MarkdownRemark {
                rawMarkdownBody
              }
            }
          }
        }
      }
    }
  `)

  if (docsResponse.errors) {
    throw docsResponse.errors
  }

  docsResponse.data.docs.edges.forEach(doc => {
    const {
      node: {
        id,
        slug,
        template,
        parent: { rawMarkdownBody }
      }
    } = doc
    const headings = parseHeadings(rawMarkdownBody, slugger)

    if (slug !== undefined) {
      let pagePath = path.posix.join(docsPrefix, slug)
      if (pagePath === '.') {
        pagePath = '/'
      }
      actions.createPage({
        component: getTemplate(template, defaultTemplate),
        path: pagePath,
        context: {
          id,
          slug,
          headings
        }
      })
    }
  })
}

module.exports = createPages
