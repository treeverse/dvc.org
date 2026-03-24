import cn from 'classnames'
import { useState } from 'react'

import menuData, {
  INavLinkData,
  INavLinkPopupData
} from '../../../../data/menu'
import Link from '../../../Link'

import * as styles from './styles.module.css'

const isPopup = (
  item: INavLinkData | INavLinkPopupData
): item is INavLinkPopupData =>
  (item as INavLinkPopupData).popupName !== undefined

interface SiteNavProps {
  onNavigate: () => void
}

const SiteNav: React.FC<SiteNavProps> = ({ onNavigate }) => {
  const [expanded, setExpanded] = useState<string | null>(null)
  const expandedItem = menuData.nav.find(
    item => isPopup(item) && item.text === expanded
  )

  return (
    <nav className={styles.siteNav} aria-label="Site navigation">
      <div className={styles.tabs}>
        {menuData.nav
          .filter(item => !(!isPopup(item) && item.eventType === 'doc'))
          .map(item =>
            isPopup(item) ? (
              <button
                key={item.text}
                className={cn(
                  styles.link,
                  expanded === item.text && styles.linkActive
                )}
                onClick={() =>
                  setExpanded(prev => (prev === item.text ? null : item.text))
                }
                aria-expanded={expanded === item.text}
              >
                {item.text}
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  aria-hidden="true"
                  className={styles.chevron}
                >
                  <path
                    d="M2.5 4L5 6.5L7.5 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <Link
                key={item.text}
                href={item.href}
                className={styles.link}
                onClick={onNavigate}
              >
                {item.text}
              </Link>
            )
          )}
      </div>
      {expandedItem && isPopup(expandedItem) && (
        <div className={styles.panel}>
          {expandedItem.items.map(sub => (
            <Link
              key={sub.label}
              href={sub.href}
              className={styles.panelLink}
              onClick={onNavigate}
            >
              {sub.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

export default SiteNav
