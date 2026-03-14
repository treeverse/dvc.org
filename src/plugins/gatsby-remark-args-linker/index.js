const _ = require('lodash')

const consts = require('../../consts')
const { ARGS_REGEXP } = consts

function patch(context, key, value) {
  if (!_.has(context, key)) {
    context[key] = value
  }

  return context[key]
}

const addIdAttrToNode = (node, id) => {
  const data = patch(node, `data`, {})

  patch(data, `id`, id)
  patch(data, `htmlAttributes`, {})
  patch(data, `hProperties`, {})
  patch(data.htmlAttributes, `id`, id)
  patch(data.hProperties, `id`, id)
}

module.exports = async (
  { markdownAST, getNode, markdownNode },
  { icon = '', className = 'anchor', isIconAfterHeader = false, pathname = '' }
) => {
  const { visit } = await import('unist-util-visit')
  if (!pathname) return markdownAST
  const parentNode = getNode(markdownNode.parent)
  let isArgsLinkerPage =
    typeof pathname === 'string'
      ? parentNode?.relativeDirectory?.split('/').includes(pathname)
      : Array.isArray(pathname)
        ? pathname.some(p =>
            parentNode?.relativeDirectory?.split('/').includes(p)
          )
        : false
  if (!isArgsLinkerPage) return markdownAST
  visit(
    markdownAST,
    node =>
      node.type === 'listItem' &&
      node.children[0]?.type === 'paragraph' &&
      node.children[0]?.children[0]?.type === 'inlineCode' &&
      String(node.children[0].children[0]?.value).startsWith('-'),
    listItemNode => {
      const isParagraphNode = listItemNode.children?.[0].type === 'paragraph'
      if (!isParagraphNode) return
      const paragraphNode = listItemNode.children[0]
      const isFirstArgNode =
        paragraphNode.children[0]?.type === 'inlineCode' &&
        String(paragraphNode.children[0]?.value).startsWith('-')
      if (isFirstArgNode) {
        const firstArgNode = paragraphNode.children[0]
        const value = firstArgNode.value
        const id = value.match(ARGS_REGEXP)[0]
        addIdAttrToNode(firstArgNode, id)

        const data = patch(listItemNode, `data`, {})
        patch(data, `htmlAttributes`, {})
        patch(data, `hProperties`, {})
        if (icon) {
          patch(data.hProperties, `style`, `position:relative;`)
          const label = id.split(`-`).join(` `)
          const method = isIconAfterHeader ? `push` : `unshift`
          listItemNode.children[method]({
            type: `link`,
            url: `#${id}`,
            title: null,
            children: [],
            data: {
              hProperties: {
                'aria-label': `option ${label.trim()} permalink`,
                class: `${className} ${isIconAfterHeader ? `after` : `before`}`
              },
              hChildren: [
                {
                  type: `raw`,
                  // The Octicon link icon is the default. But users can set their own icon via the "icon" option.
                  value: icon
                }
              ]
            }
          })
        }

        const isSecondArgNode =
          String(paragraphNode.children[1]?.value).trim() === ',' &&
          paragraphNode.children[2]?.type === 'inlineCode' &&
          String(paragraphNode.children[2].value).startsWith('-')
        if (isSecondArgNode) {
          const secondArgNode = paragraphNode.children[2]
          const value = secondArgNode.value
          const id = value.match(ARGS_REGEXP)[0]
          addIdAttrToNode(secondArgNode, id)
        }
      }
    }
  )
  // Manipulate AST
  return markdownAST
}
