import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

import autoprefixer from 'autoprefixer'
import postcssNested from 'postcss-nested'
import tailwindcss from 'tailwindcss'
import tailwindNesting from 'tailwindcss/nesting/index.js'

import 'dotenv/config'
import './src/config/prismjs/dvc.js'
import './src/config/prismjs/usage.js'
import './src/config/prismjs/dvctable.js'
import simpleLinkerTerms from './content/linked-terms.js'
import redirectsMiddleware from './server/redirect.js'
import customYoutubeTransformer from './src/config/custom-yt-embedder.js'
import sentryConfig from './src/config/sentry.js'

const require = createRequire(import.meta.url)
const __dirname = import.meta.dirname

const linkIcon = fs
  .readFileSync(path.join(__dirname, 'src', 'images', 'linkIcon.svg'))
  .toString()

const imageMaxWidth = 700

const title = 'Data Version Control · DVC'
const description =
  'Open-source version control system for Data Science and Machine Learning ' +
  'projects. Git-like experience to organize your data, models, and ' +
  'experiments.'

const keywords = [
  'data version control',
  'machine learning',
  'models management'
]

const siteUrl = process.env.HEROKU_APP_NAME
  ? `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/`
  : 'https://doc.dvc.org'

const glossaryPath = path.resolve('content', 'basic-concepts')

const docsPath = path.resolve('content', 'docs')
const docsInstanceName = 'docs'
const glossaryInstanceName = 'glossary'
const argsLinkerPath = ['command-reference', 'ref', 'cli-reference']
const sentry = true

const postCssPlugins = [
  tailwindNesting(postcssNested),
  autoprefixer,
  tailwindcss
]

const plugins = [
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
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'data',
      path: path.resolve('content', 'data')
    }
  },
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: path.resolve('static', 'img')
    }
  },
  'gatsby-plugin-image',
  {
    resolve: 'gatsby-transformer-remark',
    options: {
      plugins: [
        {
          resolve: require.resolve('./src/plugins/image-preprocessor')
        },
        {
          resolve: 'gatsby-remark-embedder',
          options: {
            customTransformers: [customYoutubeTransformer]
          }
        },
        {
          resolve: require.resolve('./src/plugins/gatsby-remark-dvc-linker'),
          options: {
            simpleLinkerTerms
          }
        },
        {
          resolve: require.resolve('./src/plugins/gatsby-remark-args-linker'),
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
        require.resolve('./src/plugins/resize-image-plugin'),
        require.resolve('./src/plugins/external-link-plugin'),
        require.resolve('./src/plugins/null-link-plugin'),
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
      ref: true,
      svgoConfig: {
        plugins: [
          {
            name: 'preset-default',
            params: {
              overrides: {
                removeViewBox: false
              }
            }
          },
          'prefixIds'
        ]
      }
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
  },
  'gatsby-plugin-catch-links',
  'gatsby-plugin-twitter',
  'gatsby-transformer-remark-frontmatter',
  {
    resolve: 'gatsby-plugin-manifest',
    options: {
      background_color: '#eff4f8',
      display: 'minimal-ui',
      icon: 'static/favicon-512x512.png',
      name: 'dvc.org',
      short_name: 'dvc.org',
      start_url: '/',
      theme_color: '#eff4f8',
      icons: [
        {
          src: '/apple-touch-icon-48x48.png',
          sizes: '48x48',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-72x72.png',
          sizes: '72x72',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-96x96.png',
          sizes: '96x96',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-144x144.png',
          sizes: '144x144',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon.png',
          sizes: '180x180',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-256x256.png',
          sizes: '256x256',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-384x384.png',
          sizes: '384x384',
          type: 'image/png'
        },
        {
          src: '/apple-touch-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    }
  }
]

// keep usercentrics plugin before plausible
const usercentricsSettingsId = process.env.GATSBY_USERCENTRICS_SETTINGS_ID
const usercentricsRulesetId = process.env.GATSBY_USERCENTRICS_RULESET_ID
if (usercentricsSettingsId || usercentricsRulesetId) {
  plugins.push({
    resolve: 'gatsby-plugin-usercentrics',
    options: {
      settingsId: usercentricsSettingsId,
      rulesetId: usercentricsRulesetId
    }
  })
}

if (process.env.NODE_ENV === 'production') {
  plugins.push({
    resolve: 'gatsby-plugin-plausible',
    options: {
      domain: new URL(siteUrl).hostname,
      apiEndpoint: '/pl/api/event',
      scriptSrc: '/pl/js/pa-MFZCoVaRDCFH3aTEbZ2Ld.js'
    }
  })
}

if (process.env.GATSBY_GTM_ID) {
  plugins.push({
    resolve: 'gatsby-plugin-gtm',
    options: {
      id: process.env.GATSBY_GTM_ID,
      includeInDevelopment: process.env.GTM_INCLUDE_IN_DEV === 'true'
    }
  })
}

if (process.env.ANALYZE) {
  plugins.push({
    resolve: 'gatsby-plugin-webpack-bundle-analyser-v2'
  })
}

export default {
  plugins: plugins.filter(Boolean),
  siteMetadata: {
    siteName: 'DVC',
    twitterUsername: 'DVCorg',
    description,
    author: 'Treeverse',
    keywords,
    siteUrl,
    title,
    titleTemplate: '',
    imageAlt: ''
  },
  trailingSlash: 'never',
  jsxRuntime: 'automatic',
  developMiddleware: app => {
    app.use(redirectsMiddleware)
  }
}
