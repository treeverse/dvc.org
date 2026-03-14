/* eslint-disable react-hooks/rules-of-hooks */

const useMatcher = (matcher, item) => {
  switch (typeof matcher) {
    case 'string':
      return item === matcher
    case 'object':
      if (Array.isArray(matcher))
        return matcher.find(submatcher => useMatcher(submatcher, item))
      if (matcher instanceof RegExp) return matcher.match(item)
      break
    default:
      throw `gatsby-remark-dvc-linker simpleLinker given bad matcher of type "${typeof matcher}"`
  }
}

const createLinkNode = (url, [node, index, parent]) =>
  url &&
  (parent.children[index] = {
    type: 'link',
    url,
    title: null,
    children: [node],
    position: node.position
  })

module.exports = { createLinkNode, useMatcher }
