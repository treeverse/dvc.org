/* eslint-env node */

const { createLinkNode, useMatcher } = require('./helpers')

const excludedParentTypes = ['link', 'heading']

module.exports = entries => astNode => {
  if (entries) {
    const node = astNode[0]
    const parent = astNode[2]

    if (!excludedParentTypes.includes(parent.type)) {
      const entry = entries.find(({ matches }) =>
        useMatcher(matches, node.value)
      )
      if (entry) {
        createLinkNode(entry.url, astNode)
      }
    }
  }

  return astNode
}
