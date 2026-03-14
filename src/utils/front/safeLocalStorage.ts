const IS_SUPPORTED = ((): boolean => {
  try {
    const key = 'localstoragecheck'
    localStorage.setItem(key, key)
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
})()

const safeLocalStorage = {
  clear: () => IS_SUPPORTED && localStorage.clear(),
  getItem: (key: string) => IS_SUPPORTED && localStorage.getItem(key),
  setItem: (key: string, value: string) =>
    IS_SUPPORTED && localStorage.setItem(key, value),
  removeItem: (key: string) => IS_SUPPORTED && localStorage.removeItem(key)
}

export default safeLocalStorage
