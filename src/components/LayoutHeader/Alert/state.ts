export const ALERT_DISMISSED_ATTRIBUTE = 'data-layout-alert-dismissed'
export const ALERT_DISMISSED_STORAGE_KEY = 'webinar-2026-09-22-alert-dismissed'

export const dismissAlert = (): void => {
  document.body.setAttribute(ALERT_DISMISSED_ATTRIBUTE, '')

  try {
    window.localStorage.setItem(ALERT_DISMISSED_STORAGE_KEY, 'true')
  } catch {
    // The banner still stays dismissed for this page when storage is blocked.
  }
}
