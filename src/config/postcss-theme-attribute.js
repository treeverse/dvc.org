/**
 * PostCSS plugin that rewrites `@media (prefers-color-scheme: …)` queries
 * from github-markdown-css into class-scoped selectors.
 *
 * This is necessary because github-markdown-css ships with
 * `prefers-color-scheme` media queries, but our theme is driven by a
 * `body.dark-mode` class (set via JS toggle, not OS preference).
 *
 * Only transforms rules inside files whose path contains
 * `github-markdown.css` to avoid affecting other stylesheets.
 */
const GITHUB_MD_RE = /[/\\]github-markdown\.css$/

const makeGitHubMarkdownCssUseThemeAttribute = () => ({
  postcssPlugin: 'makeGitHubMarkdownCssUseThemeAttribute',
  AtRule: {
    media(media, { Rule }) {
      const filePath = media.root().source?.input?.file ?? ''

      if (!GITHUB_MD_RE.test(filePath)) return

      const scopeSelector =
        media.params === '(prefers-color-scheme: dark)'
          ? 'body.dark-mode'
          : media.params === '(prefers-color-scheme: light)'
            ? ':root'
            : undefined

      if (!scopeSelector) return

      media.each(child => {
        if (child.type !== 'rule') return

        const newRule = new Rule({
          selector: `${scopeSelector} ${child.selector}`
        })

        child.each(grandChild => {
          newRule.append(grandChild.clone())
        })

        media.before(newRule)
      })

      media.remove()
    }
  }
})

makeGitHubMarkdownCssUseThemeAttribute.postcss = true

export default makeGitHubMarkdownCssUseThemeAttribute
