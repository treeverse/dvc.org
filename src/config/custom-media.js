const screens = {
  giant: 1200,
  desktop: 1005,
  tablet: 768,
  phablet: 572,
  phone: 376
}

module.exports = {
  screens,
  customMedia: {
    '--xxs-scr': `(max-width: ${screens.phone}px)`,
    '--xs-scr': `(max-width: ${screens.phablet}px)`,
    '--sm-scr': `(max-width: ${screens.tablet}px)`,
    '--md-scr': `(max-width: ${screens.desktop - 1}px)`,
    '--lg-scr': `(min-width: ${screens.desktop}px)`,
    '--xl-scr': `(min-width: ${screens.giant}px)`
  }
}
