import { Portal } from '@reach/portal'
import cn from 'classnames'
import throttle from 'lodash/throttle'
import { useRef, useState, useEffect } from 'react'

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

const getPosition = (toggle: Element, tooltip: Element): ITooltipPosition => {
  const toggleRect = toggle.getBoundingClientRect()
  const tooltipRect = tooltip.getBoundingClientRect()
  const windowWidth = document.documentElement.clientWidth
  const result: ITooltipPosition = { left: 0, top: 0, arrow: ['l', 'b'] }

  if (windowWidth - tooltipRect.width > toggleRect.left) {
    result.left = toggleRect.left
  } else {
    result.left = toggleRect.left + toggleRect.width - tooltipRect.width
    result.arrow[0] = 'r'
  }

  if (toggleRect.top > tooltipRect.height + ARROW_SIZE) {
    result.top = toggleRect.top - tooltipRect.height - ARROW_SIZE
  } else {
    result.top = toggleRect.top + toggleRect.height + ARROW_SIZE
    result.arrow[1] = 't'
  }

  return result
}

const DesktopView: React.FC<IDesktopViewProps> = ({
  description,
  header,
  text
}) => {
  const timeoutRef = useRef<number | undefined>()
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
  const throttledCalcPosition = throttle(calcPosition, 50)
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
    document.addEventListener('scroll', throttledCalcPosition)
    window.addEventListener('resize', throttledCalcPosition)

    return (): void => {
      document.removeEventListener('scroll', throttledCalcPosition)
      window.removeEventListener('resize', throttledCalcPosition)
    }
  }, [throttledCalcPosition])
  useEffect(() => {
    if (isVisible) {
      requestAnimationFrame(calcPosition)
    }
  }, [isVisible])

  return (
    <>
      {isVisible && (
        <Portal>
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
          </div>
        </Portal>
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
