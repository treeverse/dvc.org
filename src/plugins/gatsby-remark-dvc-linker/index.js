/* eslint-env node */

const constant = require('lodash/constant')
const flow = require('lodash/flow')

const apiLinker = require('./apiLinker')
const commandLinker = require('./commandLinker')
const liveLinker = require('./liveLinker')
const simpleLinker = require('./simpleLinker')

// Lifting up the AST visitor in order not to repeat the
// calculations times the amount of linkers we have
exports.default = async ({ markdownAST }, { simpleLinkerTerms }) => {
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
