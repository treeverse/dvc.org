import cn from 'classnames'
import { useState, useRef, useEffect, useCallback } from 'react'

import menuData from '@dvcorg/gatsby-theme/src/data/menu'
import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import { ReactComponent as ArrowDownSVG } from '../../../../../../../static/img/arrow-down-icon.svg'
import Link from '../../../Link'
import { NavPopup } from '../Popup'

import * as styles from './styles.module.css'

type PopupName = 'dataVersionControlPopup' | 'communityPopup'

export interface INavLinkData {
  href: string
  eventType: string
  text: string
  className?: string
}

export interface INavLinkPopupData {
  text: string
  popupName: PopupName
  items: Array<{ label: string; href: string }>
  analyticsKey: string
  ariaLabel?: string
  className?: string
  href?: string
  hideDropdown?: boolean
}

const isPopup = (
  item: INavLinkData | INavLinkPopupData
): item is INavLinkPopupData =>
  (item as INavLinkPopupData).popupName !== undefined

const LinkItems: React.FC<{
  onItemClick?: () => void
  isMobileMenu?: boolean
}> = ({ onItemClick, isMobileMenu }) => {
  const [activePopup, setActivePopup] = useState<PopupName | null>(null)
  const containerRef = useRef<HTMLUListElement>(null)
  const buttonRefs = useRef<Map<PopupName, HTMLButtonElement>>(new Map())
  const close = useCallback(() => setActivePopup(null), [])

  useEffect(() => {
    if (!activePopup) return

    const ac = new AbortController()

    if (!isMobileMenu) {
      const onClickOutside = (e: Event) => {
        if (!containerRef.current?.contains(e.target as Node)) close()
      }
      document.addEventListener('mousedown', onClickOutside, {
        signal: ac.signal
      })
      document.addEventListener('touchstart', onClickOutside, {
        signal: ac.signal,
        passive: true
      })
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopImmediatePropagation()
        const btn = buttonRefs.current.get(activePopup!)
        close()
        btn?.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown, {
      signal: ac.signal,
      capture: true
    })
    return () => ac.abort()
  }, [activePopup, isMobileMenu, close])

  return (
    <ul className={styles.linksList} ref={containerRef}>
      {menuData.nav.map((item, i) => {
        const isPopupItem = isPopup(item)
        const isOpen = isPopupItem && activePopup === item.popupName
        const popupId = isPopupItem ? `nav-popup-${item.popupName}` : undefined
        return (
          <li
            key={i}
            className={styles.linkItem}
            onPointerEnter={
              isPopupItem
                ? e => {
                    if (e.pointerType === 'mouse') {
                      setActivePopup(item.popupName)
                    }
                  }
                : undefined
            }
            onPointerLeave={
              isPopupItem
                ? e => {
                    if (e.pointerType === 'mouse') {
                      close()
                    }
                  }
                : undefined
            }
            onBlur={
              isPopupItem && !isMobileMenu
                ? e => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node))
                      close()
                  }
                : undefined
            }
          >
            {isPopupItem ? (
              <>
                <button
                  ref={el => {
                    if (el) buttonRefs.current.set(item.popupName, el)
                  }}
                  aria-label={item.ariaLabel}
                  aria-expanded={!!isOpen}
                  aria-controls={popupId}
                  onClick={() =>
                    setActivePopup(prev =>
                      prev === item.popupName ? null : item.popupName
                    )
                  }
                  className={cn(
                    styles.link,
                    isOpen && styles.open,
                    item.className
                  )}
                >
                  {item.text}
                  {!item.hideDropdown && (
                    <ArrowDownSVG className={styles.linkIcon} />
                  )}
                </button>
                <NavPopup
                  id={popupId}
                  items={item.items}
                  analyticsKey={item.analyticsKey}
                  isVisible={!!isOpen}
                  closePopup={close}
                  onNavigate={onItemClick}
                />
              </>
            ) : item.eventType ? (
              <Link
                onClick={() => {
                  logEvent('Nav', { Item: item.eventType })
                  onItemClick?.()
                }}
                href={item.href}
                className={cn(styles.link, item.className)}
              >
                {item.text}
              </Link>
            ) : null}
          </li>
        )
      })}
    </ul>
  )
}

export default LinkItems
