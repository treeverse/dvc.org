import { createRequire } from 'module'
import fs from 'fs'
import path from 'path'

import tailwindcssPostcss from '@tailwindcss/postcss'
import postcssNested from 'postcss-nested'

import './src/config/prismjs/dvc.js'
import './src/config/prismjs/dvctable.js'
import simpleLinkerTerms from './content/linked-terms.js'
import createMarkdownMiddleware from './server/markdown.js'
import redirectsMiddleware from './server/redirect.js'
import customYoutubeTransformer from './src/config/custom-yt-embedder.js'
import makeGitHubMarkdownCssUseThemeAttribute from './src/config/postcss-theme-attribute.js'

const require = createRequire(import.meta.url)
const rootDir = import.meta.dirname

const linkIcon = fs
  .readFileSync(path.join(rootDir, 'src', 'images', 'linkIcon.svg'))
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

const postCssPlugins = [
  postcssNested,
  tailwindcssPostcss(),
  makeGitHubMarkdownCssUseThemeAttribute
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
          resolve: require.resolve('./src/plugins/gatsby-remark-synopsis')
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
        require.resolve('./src/plugins/remark-external-links'),
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
        require.resolve('./src/plugins/resize-image-plugin'),
        require.resolve('./src/plugins/null-link-plugin')
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
  'gatsby-plugin-catch-links',
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
      rulesetId: usercentricsRulesetId,
      // inlined so it is already listening when Usercentrics loads
      utmShareScript: fs.readFileSync(
        path.join(
          rootDir,
          'plugins',
          'gatsby-plugin-usercentrics',
          'utm-share.js'
        ),
        'utf8'
      )
    }
  })
}

if (process.env.NODE_ENV === 'production') {
  plugins.push({
    resolve: 'gatsby-plugin-plausible',
    options: {
      dataDomain: 'dvc.org',
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
    app.use(createMarkdownMiddleware())
  }
}
