/**
 * Utility function to focus on an element by pressing a specified hotkey.
 * @param target CSS selector for the element to be focused
 * @param hotkey The key that should trigger the target element to be focused
 * @returns A function that will remove the event listener (e.g. on component unmount)
 */
export const focusElementWithHotkey = (
  target: string,
  hotkey: string
): (() => void) => {
  const hotkeyEventHandler = (e: KeyboardEvent): void => {
    if (e.key !== hotkey || document.activeElement?.matches(target)) {
      return
    }
    const targetElement = document.querySelector(target) as HTMLElement
    targetElement?.focus()
    e.preventDefault()
  }
  document.addEventListener('keydown', hotkeyEventHandler)
  return (): void => document.removeEventListener('keydown', hotkeyEventHandler)
}
