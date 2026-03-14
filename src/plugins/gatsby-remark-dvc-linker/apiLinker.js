import { CLI_API_REGEXP, METHOD_REGEXP, docUrls } from '../../consts.js'
import { getItemByPath } from '../../utils/shared/sidebar.js'

import { createLinkNode } from './helpers.js'

export default astNode => {
  const node = astNode[0]
  const parent = astNode[2]

  if (parent.type !== 'link' && CLI_API_REGEXP.test(node.value)) {
    const parts = node.value.split('.')
    let url

    const isMethod = parts[2] && METHOD_REGEXP.test(parts[2])
    const method = isMethod && parts[2].slice(0, -2)
    const isRoot =
      (parts[0] === 'dvc' || parts[0] === 'mlem') &&
      parts[1] === 'api' &&
      !parts[2]

    if (isRoot) {
      url = `${docUrls.apiReference}`
    } else {
      url = `${docUrls.apiReference}${method}`
    }

    const isMethodPageExists = getItemByPath(url)
    if (isMethodPageExists) {
      createLinkNode(url, astNode)
    }
  }

  return astNode
}
