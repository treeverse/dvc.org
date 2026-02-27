import cn from 'classnames'

import menuData from '@dvcorg/gatsby-theme/src/data/menu'
import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import usePopup, {
  IUsePopupReturn
} from '../../../../../../../src/gatsby/hooks/usePopup'
import { ReactComponent as ArrowDownSVG } from '../../../../../../../static/img/arrow-down-icon.svg'
import { ReactComponent as ArrowUpSVG } from '../../../../../../../static/img/arrow-up-icon.svg'
import { ReactComponent as EllipsisIcon } from '../../../../../../../static/img/ellipsis.svg'
import Link from '../../../Link'
import { IPopupProps } from '../Popup'

import * as styles from './styles.module.css'

type PopupName =
  | 'communityPopup'
  | 'otherToolsPopup'
  | 'otherPopup'
  | 'dataVersionControlPopup'

export interface INavLinkData {
  href: string
  eventType: string
  text: string
  className?: string
}

export interface INavLinkPopupData {
  text: string | typeof EllipsisIcon
  popupName: PopupName
  ariaLabel?: string
  Popup: React.FC<IPopupProps>
  className?: string
  href?: string
  hideDropdown?: boolean
}

const isPopup = (
  item: INavLinkData | INavLinkPopupData
): item is INavLinkPopupData =>
  (item as INavLinkPopupData).popupName !== undefined

const LinkItems: React.FC = () => {
  const communityPopup = usePopup()
  const otherToolsPopup = usePopup()
  const otherPopup = usePopup()
  const dataVersionControlPopup = usePopup()
  const popups: { [key: string]: IUsePopupReturn } = {
    otherToolsPopup,
    communityPopup,
    otherPopup,
    dataVersionControlPopup
  }

  return (
    <ul className={styles.linksList}>
      {menuData.nav.map((item, i) => {
        const popup = isPopup(item) ? popups[item.popupName] : undefined
        return (
          <li
            key={i}
            className={styles.linkItem}
            ref={popup?.containerEl}
            onMouseEnter={popup?.open}
            onMouseLeave={popup?.close}
          >
            {isPopup(item) && popup ? (
              <>
                <button
                  aria-label={item.ariaLabel}
                  onPointerUp={popup?.toggle}
                  className={cn(
                    styles.link,
                    popup?.isOpen && styles.open,
                    item.className
                  )}
                >
                  {typeof item.text === 'string' ? item.text : <item.text />}
                  {!item.hideDropdown && (
                    <>
                      <ArrowDownSVG
                        className={cn(styles.linkIcon, styles.arrowDownIcon)}
                      />
                      <ArrowUpSVG
                        className={cn(styles.linkIcon, styles.arrowUpIcon)}
                      />
                    </>
                  )}
                </button>
                <item.Popup isVisible={popup.isOpen} closePopup={popup.close} />
              </>
            ) : (
              !isPopup(item) &&
              item.eventType && (
                <Link
                  onClick={(): void =>
                    logEvent('Nav', { Item: item.eventType })
                  }
                  href={item.href}
                  className={cn(styles.link, item.className)}
                >
                  {item.text}
                </Link>
              )
            )}
          </li>
        )
      })}
    </ul>
  )
}

export default LinkItems
