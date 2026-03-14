import { createLinkNode, useMatcher } from './helpers.js'

const excludedParentTypes = ['link', 'heading']

export default entries => astNode => {
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
