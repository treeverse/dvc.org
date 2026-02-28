const path = require('path')

const defaults = require('./config-defaults')
const { DOCS_PREFIX } = require('./consts')

const defaultGetTemplate = (template, defaultTemplate) =>
  template
    ? require.resolve(path.resolve('src', 'templates', template + '.tsx'))
    : defaultTemplate

const docsPrefix = DOCS_PREFIX

exports.pluginOptionsSchema = ({ Joi }) => {
  return Joi.object({
    disable: Joi.boolean().default(Boolean(process.env.SKIP_DOCS)),
    getTemplate: Joi.function().default(() => defaultGetTemplate),
    defaultTemplate: Joi.string().default(
      require.resolve('./src/templates/doc.tsx')
    ),
    remark: Joi.boolean().default(true),
    filesystem: Joi.boolean().default(true),
    glossaryPath: Joi.string().default(
      path.resolve('content', 'docs', 'user-guide', 'basic-concepts')
    ),
    docsDirectory: Joi.string().default(path.resolve('content', 'docs')),
    glossaryInstanceName: Joi.string().default('glossary').allow(false),
    docsInstanceName: Joi.string().default('docs').allow(false),
    docsPrefix: Joi.string().default(docsPrefix),
    simpleLinkerTerms: Joi.array().items(
      Joi.object({
        matches: Joi.string(),
        url: Joi.string()
      })
    ),
    postCssPlugins: Joi.array(),
    argsLinkerPath: Joi.alternatives()
      .try(Joi.string(), Joi.array().items(Joi.string()))
      .default(defaults.argsLinkerPath),
    sentry: Joi.boolean().default(defaults.sentry)
  })
}

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
}

exports.onCreateBabelConfig = ({ actions }) => {
  actions.setBabelPlugin({
    name: '@babel/plugin-transform-react-jsx',
    options: {
      runtime: 'automatic'
    }
  })
}

exports.createPages = require('./createPages')

exports.onCreateNode = require('./onCreateNode')

// Ignore warnings about CSS inclusion order, because we use CSS modules.
// https://spectrum.chat/gatsby-js/general/having-issue-related-to-chunk-commons-mini-css-extract-plugin~0ee9c456-a37e-472a-a1a0-cc36f8ae6033?m=MTU3MjYyNDQ5OTAyNQ==
exports.onCreateWebpackConfig = ({ getConfig }) => {
  const config = getConfig()
  const miniCssExtractPlugin = config.plugins.find(
    plugin => plugin.constructor.name === 'MiniCssExtractPlugin'
  )
  if (miniCssExtractPlugin) {
    miniCssExtractPlugin.options.ignoreOrder = true
  }
}
