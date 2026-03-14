const path = require('path')

const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin')

const { DOCS_PREFIX } = require('./src/consts')
const { setPageContext } = require('./src/gatsby/common')
const models = require('./src/gatsby/models')
const callOnModels = require('./src/gatsby/utils/models')

const disable = Boolean(process.env.SKIP_DOCS)

const defaultGetTemplate = (template, defaultTemplate) =>
  template
    ? require.resolve(path.resolve('src', 'templates', template + '.tsx'))
    : defaultTemplate

const getTemplate = defaultGetTemplate
const defaultTemplate = require.resolve('./src/templates/doc.tsx')
const docsPrefix = DOCS_PREFIX

exports.createSchemaCustomization = async api => {
  const {
    actions: { createTypes },
    schema: { buildObjectType }
  } = api
  createTypes([
    buildObjectType({
      name: 'DocsPage',
      interfaces: ['Node'],
      fields: {
        template: 'String',
        title: 'String',
        description: 'String',
        slug: 'String',
        sourcePath: 'String'
      }
    }),
    buildObjectType({
      name: 'GlossaryEntry',
      interfaces: ['Node'],
      fields: {
        tooltip: {
          type: 'String!'
        },
        name: 'String!',
        match: '[String]'
      }
    }),
    buildObjectType({
      name: 'SiteSiteMetadata',
      fields: {
        author: 'String',
        siteUrl: 'String',
        titleTemplate: 'String'
      }
    })
  ])
  await callOnModels(models, 'createSchemaCustomization', api)
}

exports.sourceNodes = api => callOnModels(models, 'sourceNodes', api)

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: '@babel/plugin-transform-react-jsx',
    options: {
      runtime: 'automatic'
    }
  })
}

exports.createPages = async api => {
  await require('./src/gatsby/createPages')(api, {
    disable,
    defaultTemplate,
    getTemplate,
    docsPrefix
  })
  await callOnModels(models, 'createPages', api)
}

exports.onCreateNode = async api => {
  await require('./src/gatsby/onCreateNode')(api, {
    disable,
    glossaryInstanceName: 'glossary',
    docsInstanceName: 'docs'
  })
  await callOnModels(models, 'onCreateNode', api)
}

exports.createResolvers = api => callOnModels(models, 'createResolvers', api)

exports.onPostBuild = api => callOnModels(models, 'onPostBuild', api)

exports.onCreatePage = ({ page, actions }) => {
  setPageContext(page, actions)
}

// Ignore warnings about CSS inclusion order, because we use CSS modules.
// https://spectrum.chat/gatsby-js/general/having-issue-related-to-chunk-commons-mini-css-extract-plugin~0ee9c456-a37e-472a-a1a0-cc36f8ae6033?m=MTU3MjYyNDQ5OTAyNQ==
exports.onCreateWebpackConfig = ({ stage, actions, getConfig }) => {
  if (stage === 'build-javascript') {
    const config = getConfig()

    // Add polyfills
    config.entry.app = [
      'promise-polyfill/src/polyfill',
      'isomorphic-fetch',
      'raf-polyfill',
      ...[].concat(config.entry.app)
    ]

    const miniCssExtractPlugin = config.plugins.find(
      plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
    )
    if (miniCssExtractPlugin) {
      miniCssExtractPlugin.options.ignoreOrder = true
    }
    actions.replaceWebpackConfig(config)
  }
  actions.setWebpackConfig({
    resolve: {
      plugins: [new TsconfigPathsPlugin()]
    }
  })
}
