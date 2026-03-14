import constant from 'lodash/constant.js'
import flow from 'lodash/flow.js'

import apiLinker from './apiLinker.js'
import commandLinker from './commandLinker.js'
import liveLinker from './liveLinker.js'
import simpleLinker from './simpleLinker.js'

// Lifting up the AST visitor in order not to repeat the
// calculations times the amount of linkers we have
export default async ({ markdownAST }, { simpleLinkerTerms }) => {
  const { visit } = await import('unist-util-visit')
  visit(
    markdownAST,
    'inlineCode',
    flow([
      Array,
      liveLinker,
      commandLinker(simpleLinkerTerms),
      apiLinker,
      simpleLinker(simpleLinkerTerms),
      constant(undefined)
    ])
  )
  return markdownAST
}
