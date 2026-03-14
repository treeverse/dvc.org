const safeQuerySelector = (query: string): null | Element => {
  try {
    const el = document.querySelector(query)
    return el
  } catch {
    return null
  }
}

export default safeQuerySelector
