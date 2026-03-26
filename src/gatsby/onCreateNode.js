import path from 'path'

import { remark } from 'remark'
import remarkHtml from 'remark-html'
import recommended from 'remark-preset-lint-recommended'

import simpleLinkerTerms from '../../content/linked-terms.js'
import dvcLinker from '../plugins/gatsby-remark-dvc-linker/index.js'

let tooltipHTMLProcessor
const getTooltipHTMLProcessor = () => {
  if (!tooltipHTMLProcessor) {
    tooltipHTMLProcessor = remark()
      .use(recommended)
      .use(() => async tree => {
        await dvcLinker({ markdownAST: tree }, { simpleLinkerTerms })
      })
      .use(remarkHtml)
  }
  return tooltipHTMLProcessor
}

const processTooltip = async tooltip => {
  const processor = getTooltipHTMLProcessor()
  const vfile = await processor.process(tooltip)
  return vfile.toString()
}

async function onCreateNode(
  {
    node,
    getNode,
    createNodeId,
    createContentDigest,
    actions: { createNode, createParentChildLink }
  },
  { disable, glossaryInstanceName, docsInstanceName }
) {
  if (disable || node.internal.type !== 'MarkdownRemark') {
    return
  }

  if (!node.parent) {
    console.warn(`MarkdownRemark node doesn't have a parent`)
    return
  }

  const parentFileNode = getNode(node.parent)

  if (parentFileNode === undefined) {
    console.warn(`getNode on parent with ID ${node.parent} was undefined`)
    return
  }
  if (parentFileNode.internal.type !== 'File') {
    console.warn(
      `parent of markdown node was not a File, but a ${node.internal.type}`
    )
    return
  }

  if (parentFileNode.sourceInstanceName === glossaryInstanceName) {
    // Glossary

    const {
      frontmatter: { name: frontmatterName, match, tooltip }
    } = node

    const glossaryFieldData = {
      name: frontmatterName,
      match,
      tooltip: tooltip && (await processTooltip(tooltip))
    }

    const entryNode = {
      ...glossaryFieldData,
      id: createNodeId(`DVCGlossaryEntry >>> ${node.id}`),
      parent: node.id,
      children: [],
      internal: {
        type: `GlossaryEntry`,
        contentDigest: createContentDigest(glossaryFieldData)
      }
    }

    createNode(entryNode)
    createParentChildLink({ parent: node, child: entryNode })
  }

  if (parentFileNode.sourceInstanceName === docsInstanceName) {
    // Doc page
    const { name, relativePath, relativeDirectory } = parentFileNode

    const slug =
      name === 'index'
        ? relativeDirectory
        : path.posix.join(relativeDirectory, name)

    const fieldData = {
      slug,
      sourcePath: relativePath,
      template: node.frontmatter.template,
      title: node.frontmatter.title === '' ? null : node.frontmatter.title,
      description: node.frontmatter.description
    }

    const docNode = {
      ...fieldData,
      id: createNodeId(`MarkdownDocsPage >>> ${node.id}`),
      parent: node.id,
      children: [],
      internal: {
        type: `DocsPage`,
        contentDigest: createContentDigest(fieldData)
      }
    }

    createNode(docNode)
    createParentChildLink({ parent: node, child: docNode })
  }
}

export default onCreateNode
