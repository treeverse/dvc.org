/** HAST - Hypertext Abstract Syntax Tree */
async function convertHtmlToHast(htmlString) {
  const { unified } = await import('unified')
  const parse = (await import('rehype-parse')).default
  return unified().use(parse, { fragment: true }).parse(htmlString)
}

async function convertHastToHtml(htmlAst) {
  const { unified } = await import('unified')
  const stringify = (await import('rehype-stringify')).default
  return unified().use(stringify).stringify(htmlAst)
}

module.exports = {
  convertHastToHtml,
  convertHtmlToHast
}
