/*
  Support for resize image inline on markdown
  Syntax "=WIDTH", ":wrap-left" and ":wrap-right"

  Examples
  ![](/relative-path-image "=500")
  ![](/relative-path-image "=500 Some Title")
  ![](/relative-path-image "Some Title =500")
  ![](/relative-path-image "Some Title :wrap-left =500")
  ![](/relative-path-image ":wrap-left =500 Some Title")
*/

const {
  imageClass,
  imageWrapperClass
} = require('gatsby-remark-images/constants')

const imageMaxWidth = 700

const { convertHtmlToHast, convertHastToHtml } = require('../utils/convertHast')

const {
  imageWrapClassPrefix,
  imageWrapStopClass,
  stopWrapTag
} = require('./constants')

const extractInstructions = titleString => {
  const regexResize = /=\d{2,4}/g
  const regexWrap = /:wrap-(left|right)/

  const title = titleString
    .replace(regexResize, '')
    .replace(regexWrap, '')
    .trim()
  const resize = titleString.match(regexResize)
  const wrap = titleString.match(regexWrap)

  return {
    resize: resize ? Number(resize[0].replace('=', '')) : null,
    title,
    wrap: wrap ? wrap[1] : null
  }
}

module.exports = async ({ markdownAST }) => {
  const { selectAll, select } = await import('hast-util-select')
  const { visit } = await import('unist-util-visit')
  let nodes = []
  visit(markdownAST, 'html', node => {
    nodes.push(node)
  })
  for (const node of nodes) {
    const regexMaxWidth = /max-width: \d{1,5}px/g
    const hast = await convertHtmlToHast(node.value)

    /*
       Image related HTML produced by Gatsby looks like:

       <span .gatsby-resp-image-wrapper max-width: 100px>
        <a .gatsby-resp-image-link href='/static/...'>
          <span .gatsby-resp-image-background-image background-Image>
          <picture>
            <source srcset="/static/...webp 600w">
            <source srcset="/static/...jpg 600w">
            <img .gatsby-resp-image-image title='..' alt='...' max-width: 100%>
          ...
    */
    const wrapperImages = selectAll(`.${imageWrapperClass}`, hast)
    if (!wrapperImages.length) {
      continue
    }
    for (const wrapperImage of wrapperImages) {
      const source = select(`picture > source:first-child`, wrapperImage)
      const image = select(`.${imageClass}`, wrapperImage)
      const { resize, title, wrap } = extractInstructions(
        image.properties.title
      )

      if (resize || wrap) {
        //  by default Gatsby populates title value with alt,
        //  restoring it here if needed
        image.properties.title = title ? title : image.properties.alt
      }

      const maxWidth = wrapperImage.properties.style
        .match(regexMaxWidth)[0]
        .replace(/\D/g, '')

      if (wrap) {
        const { className, style } = wrapperImage.properties
        wrapperImage.properties.className = `${
          className || ''
        } ${imageWrapClassPrefix}${wrap}`

        // Prevent us from using an !important in the CSS
        wrapperImage.properties.style = style.replace(
          /margin-(left|right):\s+auto/g,
          ''
        )
      }

      const srcSetLines = source.properties.srcSet.split(/\n/)
      const sizeString = srcSetLines[srcSetLines.length - 1].split(' ')[1]
      if (sizeString) {
        const originalSize = sizeString && sizeString.replace('w', '')

        if (resize || imageMaxWidth * 2 > originalSize) {
          wrapperImage.properties.style = wrapperImage.properties.style.replace(
            regexMaxWidth,
            `max-width: ${
              resize ? Math.min(resize, maxWidth) : originalSize / 2
            }px`
          )
        }
      }
    }

    for (const stopWrap of selectAll(stopWrapTag, hast)) {
      stopWrap.tagName = 'div'
      stopWrap.properties.className = imageWrapStopClass
    }

    node.value = await convertHastToHtml(hast)
  }
}

module.exports.extractInstructions = extractInstructions
