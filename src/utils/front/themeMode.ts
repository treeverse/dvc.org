/**
 * Type definitions and thin wrappers around the globals set by the inline
 * script in gatsby-ssr.js.
 *
 * The inline script is the single source of truth — it runs before React,
 * sets dark-mode/light-mode class on <body> (survives Gatsby hydration), and exposes:
 *   window.__themeMode        — 'light' | 'dark' | 'system'
 *   window.__resolvedTheme    — 'light' | 'dark'
 *   window.__setThemeMode(m)  — change the theme
 */

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

declare global {
  interface Window {
    __themeMode: ThemeMode
    __resolvedTheme: ResolvedTheme
    __setThemeMode: (mode: ThemeMode) => void
  }
}

export const getThemeMode = (): ThemeMode =>
  typeof window !== 'undefined' && window.__themeMode
    ? window.__themeMode
    : 'system'

export const getResolvedTheme = (): ResolvedTheme =>
  typeof window !== 'undefined' && window.__resolvedTheme
    ? window.__resolvedTheme
    : 'light'

export const setThemeMode = (mode: ThemeMode): void => {
  if (typeof window !== 'undefined' && window.__setThemeMode) {
    window.__setThemeMode(mode)
  }
}
