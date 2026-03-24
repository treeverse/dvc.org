import cn from 'classnames'
import { useCallback, useId, useState } from 'react'

import {
  type ThemeMode,
  getThemeMode,
  setThemeMode
} from '../../../utils/front/themeMode'

import * as styles from './styles.module.css'

interface IThemeSwitcherProps {
  className?: string
}

const MODE_ORDER: ThemeMode[] = ['system', 'light', 'dark']
const COLON_RE = /:/g

const MODE_LABELS: Record<ThemeMode, string> = {
  system: 'system preference',
  light: 'light mode',
  dark: 'dark mode'
}

function nextMode(current: ThemeMode): ThemeMode {
  return MODE_ORDER[(MODE_ORDER.indexOf(current) + 1) % MODE_ORDER.length]
}

const ThemeSwitcher: React.FC<IThemeSwitcherProps> = ({ className }) => {
  const maskId = `themeMoonMask${useId().replace(COLON_RE, '')}`
  const [mode, setMode] = useState<ThemeMode>(getThemeMode)

  const handleClick = useCallback(() => {
    setMode(prev => {
      const next = nextMode(prev)
      setThemeMode(next)
      return next
    })
  }, [])

  const label = `Switch to ${MODE_LABELS[nextMode(mode)]}`

  return (
    <button
      type="button"
      className={cn(styles.button, className)}
      aria-label={label}
      data-tooltip={label}
      onClick={handleClick}
    >
      <svg
        className={styles.morphIcon}
        viewBox="0 0 24 24"
        width="24"
        height="24"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <mask
            id={maskId}
            x="0"
            y="0"
            width="24"
            height="24"
            maskUnits="userSpaceOnUse"
            maskContentUnits="userSpaceOnUse"
          >
            <rect x="0" y="0" width="24" height="24" fill="white" />
            <circle
              className={styles.moonCutout}
              cx="15.2"
              cy="8.8"
              r="6.1"
              fill="black"
            />
          </mask>
        </defs>

        {/* Sun core */}
        <circle
          className={styles.sunCore}
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
        />

        {/* Sun rays */}
        <g
          className={styles.rays}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="12" y1="1" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="1" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="19.78" y1="4.22" x2="17.66" y2="6.34" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="19.78" y1="19.78" x2="17.66" y2="17.66" />
        </g>

        {/* Moon body */}
        <circle
          className={styles.moonBody}
          cx="12"
          cy="12"
          r="9"
          fill="currentColor"
          mask={`url(#${maskId})`}
        />

        {/* System ring */}
        <circle
          className={styles.systemRing}
          cx="12"
          cy="12"
          r="9"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />

        {/* System fill */}
        <g className={styles.systemFill}>
          <path
            d="M12 3a9 9 0 0 0 0 18z"
            fill="currentColor"
            transform="rotate(45 12 12)"
          />
        </g>
      </svg>
    </button>
  )
}

export default ThemeSwitcher
