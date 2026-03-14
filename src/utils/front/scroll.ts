import isClient from './isClient'

export const getScrollPosition = (): number =>
  isClient ? window.pageYOffset : 0
