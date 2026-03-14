const handleMouseDownOnce = (): void => {
  document.body.classList.remove('user-is-tabbing')
  window.removeEventListener('mousedown', handleMouseDownOnce)
  window.addEventListener('keydown', handleFirstTab)
}

export const handleFirstTab = (e: KeyboardEvent): void => {
  if (e.code === 'Tab') {
    document.body.classList.add('user-is-tabbing')
    window.removeEventListener('keydown', handleFirstTab)
    window.addEventListener('mousedown', handleMouseDownOnce)
  }
}
