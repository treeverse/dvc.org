const IS_CLIENT = ((): boolean => {
  let isDefined = false
  try {
    isDefined = typeof window !== 'undefined'
  } catch {
    // nothing to do here, move on
  }
  return isDefined
})()

export default IS_CLIENT
