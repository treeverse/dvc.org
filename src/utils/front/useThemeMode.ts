import { useCallback, useEffect, useState } from 'react'

import {
  type ThemeMode,
  type ResolvedTheme,
  getThemeMode,
  getResolvedTheme,
  setThemeMode as setThemeModeGlobal
} from './themeMode'

export type { ThemeMode, ResolvedTheme }

const THEME_EVENT = 'theme-modechange'

/**
 * Hook that owns the user's theme preference (light / dark / system).
 *
 * Starts from a hydration-safe server/client value ('system'), then syncs to
 * the window globals set by the inline script in gatsby-ssr.js after mount.
 * Writes via window.__setThemeMode which handles DOM, localStorage, and
 * dispatches the 'theme-modechange' event.
 */
export const useThemeMode = (): [ThemeMode, (mode: ThemeMode) => void] => {
  const [mode, setMode] = useState<ThemeMode>('system')

  useEffect(() => {
    setMode(getThemeMode())

    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.mode) setMode(detail.mode)
    }
    window.addEventListener(THEME_EVENT, onThemeChange)
    return () => window.removeEventListener(THEME_EVENT, onThemeChange)
  }, [])

  const updateMode = useCallback((next: ThemeMode) => {
    setThemeModeGlobal(next)
  }, [])

  return [mode, updateMode]
}

/**
 * Read-only hook that tracks the resolved theme (always 'light' | 'dark').
 *
 * Starts from a hydration-safe value ('light'), then syncs to
 * the window globals set by the inline script in gatsby-ssr.js after mount.
 */
export const useResolvedTheme = (): ResolvedTheme => {
  const [resolved, setResolved] = useState<ResolvedTheme>('light')

  useEffect(() => {
    setResolved(getResolvedTheme())

    const onThemeChange = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.resolved) setResolved(detail.resolved)
    }
    window.addEventListener(THEME_EVENT, onThemeChange)
    return () => window.removeEventListener(THEME_EVENT, onThemeChange)
  }, [])

  return resolved
}
