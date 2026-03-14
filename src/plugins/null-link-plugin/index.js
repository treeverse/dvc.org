module.exports = async ({ markdownAST }) => {
  const { visit } = await import('unist-util-visit')
  visit(markdownAST, 'link', node => {
    if (!node.url && node?.children?.[0]?.type === 'inlineCode') {
      node.type = 'inlineCode'
      node.value = node.children[0].value
    }
  })
}
