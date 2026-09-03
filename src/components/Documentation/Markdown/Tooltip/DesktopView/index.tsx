import cn from 'clsx/lite'
import { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

import * as styles from './styles.module.css'

interface IDesktopViewProps {
  description: string
  header: string
  text: React.ReactNode
}

interface ITooltipPosition {
  left: number
  top: number
  arrow: ['l' | 'r', 't' | 'b']
}

const ARROW_SIZE = 10
const VIEWPORT_PADDING = 16

const getNavbarBottom = (): number => {
  const header = document.getElementById('header')

  return header?.getBoundingClientRect().bottom ?? 0
}

const getPosition = (toggle: Element, tooltip: Element): ITooltipPosition => {
  const toggleRect = toggle.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const windowWidth = document.documentElement.clientWidth
  const windowHeight = document.documentElement.clientHeight
  const safeTop = getNavbarBottom() + VIEWPORT_PADDING
  const safeBottom = windowHeight - VIEWPORT_PADDING
  const result: ITooltipPosition = { left: 0, top: 0, arrow: ['l', 'b'] }
  const leftAligned = toggleRect.left
  const rightAligned = toggleRect.left + toggleRect.width - tooltipRect.width
  const maxLeft = windowWidth - tooltipRect.width - VIEWPORT_PADDING
  const topPosition = toggleRect.top - tooltipRect.height - ARROW_SIZE
  const bottomPosition = toggleRect.bottom + ARROW_SIZE
  const availableAbove = toggleRect.top - safeTop
  const availableBelow = safeBottom - toggleRect.bottom
  const shouldOpenAbove =
    availableAbove >= tooltipRect.height + ARROW_SIZE ||
    availableAbove >= availableBelow

  if (windowWidth - tooltipRect.width > toggleRect.left) {
    result.left = leftAligned
  } else {
    result.left = rightAligned
    result.arrow[0] = 'r'
  }

  result.left = Math.max(VIEWPORT_PADDING, Math.min(result.left, maxLeft))

  if (shouldOpenAbove) {
    result.top = topPosition
  } else {
    result.top = bottomPosition
    result.arrow[1] = 't'
  }

  result.top = Math.max(
    safeTop,
    Math.min(result.top, safeBottom - tooltipRect.height)
  )
  result.arrow[1] =
    result.top + tooltipRect.height / 2 < toggleRect.top + toggleRect.height / 2
      ? 'b'
      : 't'

  return result
}

const DesktopView: React.FC<IDesktopViewProps> = ({
  description,
  header,
  text
}) => {
  const timeoutRef = useRef<number | undefined>(undefined)
  const toggleRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [tooltipPosition, setPosition] = useState<
    ITooltipPosition | undefined
  >()
  const [isVisible, setVisible] = useState(false)
  const calcPosition = (): void => {
    if (!tooltipRef.current || !toggleRef.current) {
      return
    }

    setPosition(getPosition(toggleRef.current, tooltipRef.current))
  }
  const show = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = undefined
    }

    setVisible(true)
  }
  const hide = (): void => {
    timeoutRef.current = window.setTimeout(() => setVisible(false), 100)
  }

  useEffect(() => {
    if (!isVisible) return

    let rafId = requestAnimationFrame(calcPosition)
    const scheduleCalc = (): void => {
      if (!rafId)
        rafId = requestAnimationFrame(() => {
          rafId = 0
          calcPosition()
        })
    }
    document.addEventListener('scroll', scheduleCalc, { passive: true })
    window.addEventListener('resize', scheduleCalc, { passive: true })

    return (): void => {
      document.removeEventListener('scroll', scheduleCalc)
      window.removeEventListener('resize', scheduleCalc)
      cancelAnimationFrame(rafId)
    }
  }, [isVisible])

  return (
    <>
      {isVisible &&
        createPortal(
          <div
            ref={tooltipRef}
            className={cn(
              styles.tooltip,
              tooltipPosition?.arrow && styles.calculated,
              tooltipPosition?.arrow && styles[tooltipPosition.arrow.join('')]
            )}
            style={tooltipPosition}
            onMouseOver={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
          >
            <div className={styles.tooltipHeader}>{header}</div>
            <div
              className={cn('markdown-body', styles.tooltipBody)}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          </div>,
          document.body
        )}
      <span
        ref={toggleRef}
        className={styles.highlightedText}
        onMouseOver={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {text}
      </span>
    </>
  )
}

export default DesktopView
