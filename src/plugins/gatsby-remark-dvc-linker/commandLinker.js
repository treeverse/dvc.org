import {
  docUrls,
  ARGS_REGEXP,
  CLI_REGEXP,
  COMMAND_REGEXP
} from '../../consts.js'
import { getItemByPath } from '../../utils/shared/sidebar.js'

import { createLinkNode, useMatcher } from './helpers.js'

export default aliasEntries => astNode => {
  const node = astNode[0]
  const parent = astNode[2]
  if (parent.type !== 'link' && CLI_REGEXP.test(node.value)) {
    const parts = node.value.split(/\s+/)
    const index = parts.findIndex(part => {
      const cli = String(part).trim()
      return cli === 'dvc'
    })
    const cli = parts[index]
    const command = parts[index + 1]
    const aliasEntry =
      aliasEntries &&
      aliasEntries.find(({ matches }) =>
        useMatcher(matches, `${cli} ${command}`)
      )
    const baseUrl =
      aliasEntry && aliasEntry.url
        ? aliasEntry.url
        : `${docUrls.commandReference}${command}`
    let url
    const isCommandPageExists = getItemByPath(baseUrl)
    if (isCommandPageExists) {
      url = baseUrl
      for (const arg of parts.slice(index + 2)) {
        if (arg && COMMAND_REGEXP.test(arg) && getItemByPath(`${url}/${arg}`)) {
          url = `${url}/${arg}`
        } else if (arg && ARGS_REGEXP.test(arg)) {
          const id = arg.match(ARGS_REGEXP)[0]
          url = `${url}#${id}`
          break
        }
      }
      createLinkNode(url, astNode)
    }
  }
  return astNode
}
