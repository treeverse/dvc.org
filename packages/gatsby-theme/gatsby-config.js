require('dotenv').config()
const fs = require('fs')
const path = require('path')

const autoprefixer = require('autoprefixer')

require('./config/prismjs/dvc')
require('./config/prismjs/usage')
require('./config/prismjs/dvctable')
const customYoutubeTransformer = require('./config/gatsby-remark-embedder/custom-yt-embedder')
const defaults = require('./config-defaults')
const sentryConfig = require('./sentry-config')

const linkIcon = fs
  .readFileSync(path.join(__dirname, 'src', 'images', 'linkIcon.svg'))
  .toString()

const imageMaxWidth = 700

module.exports = ({
  simpleLinkerTerms,
  postCssPlugins = [
    require('tailwindcss/nesting')(require('postcss-nested')),
    autoprefixer,
    require('tailwindcss')
  ],
  docsInstanceName = defaults.docsInstanceName,
  docsPath = defaults.docsPath,
  glossaryInstanceName = defaults.glossaryInstanceName,
  glossaryPath = defaults.glossaryPath,
  argsLinkerPath = defaults.argsLinkerPath,
  sentry = defaults.sentry
}) => ({
  plugins: [
    {
      resolve: 'gatsby-plugin-postcss',
      options: {
        postCssPlugins
      }
    },
    'gatsby-plugin-sitemap',
    glossaryInstanceName && {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: glossaryInstanceName,
        path: glossaryPath
      }
    },
    docsInstanceName && {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: docsInstanceName,
        path: docsPath
      }
    },
    'gatsby-plugin-image',
    {
      resolve: 'gatsby-transformer-remark',
      options: {
        plugins: [
          {
            resolve: require.resolve('./plugins/image-preprocessor')
          },
          {
            resolve: 'gatsby-remark-embedder',
            options: {
              customTransformers: [customYoutubeTransformer]
            }
          },
          {
            resolve: require.resolve('./plugins/gatsby-remark-dvc-linker'),
            options: {
              simpleLinkerTerms
            }
          },
          {
            resolve: require.resolve('./plugins/gatsby-remark-args-linker'),
            options: {
              icon: linkIcon,
              // Pathname can also be array of paths. eg: ['docs/command-reference;', 'docs/api']
              pathname: argsLinkerPath
            }
          },
          {
            resolve: 'gatsby-remark-prismjs',
            options: {
              noInlineHighlight: true,
              languageExtensions: [
                {
                  language: 'text',
                  definition: {}
                }
              ]
            }
          },
          {
            resolve: 'gatsby-remark-smartypants',
            options: {
              quotes: false
            }
          },
          {
            resolve: 'gatsby-remark-embed-gist',
            options: {
              gistDefaultCssInclude: false
            }
          },
          'gatsby-remark-external-links',
          {
            resolve: 'gatsby-remark-autolink-headers',
            options: {
              enableCustomId: true,
              isIconAfterHeader: true,
              icon: linkIcon
            }
          },
          {
            resolve: 'gatsby-remark-images',
            options: {
              maxWidth: imageMaxWidth,
              withWebp: true,
              quality: 90,
              loading: 'auto'
            }
          },
          'gatsby-remark-responsive-iframe',
          require.resolve('./plugins/resize-image-plugin'),
          require.resolve('./plugins/external-link-plugin'),
          require.resolve('./plugins/null-link-plugin'),
          // moving this plugin after external-link-plugin to allow images to be copied to public folder
          {
            resolve: 'gatsby-remark-copy-relative-linked-files',
            options: {
              filename: ({ name, hash, extension }) =>
                `${name}-${hash}.${extension}`
            }
          }
        ]
      }
    },
    {
      resolve: 'gatsby-plugin-svgr',
      options: {
        ref: true
      }
    },
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-plugin-sharp',
      options: {
        defaults: {
          placeholder: 'blurred'
        }
      }
    },
    sentry && {
      resolve: '@sentry/gatsby',
      options: sentryConfig
    }
  ].filter(Boolean),
  siteMetadata: {
    author: 'Treeverse',
    titleTemplate: '',
    twitterUsername: '',
    imageAlt: ''
  },
  trailingSlash: 'never',
  jsxRuntime: 'automatic'
})
