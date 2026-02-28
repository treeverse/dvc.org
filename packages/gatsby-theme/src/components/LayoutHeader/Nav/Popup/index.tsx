import cn from 'classnames'
import { PropsWithChildren } from 'react'

import { logEvent } from '@dvcorg/gatsby-theme/src/utils/front/plausible'

import Link from '../../../Link'

import * as styles from './styles.module.css'

export interface IPopupProps {
  isVisible: boolean
  closePopup: () => void
}

export const BasePopup: React.FC<
  PropsWithChildren<{
    className?: string
    isVisible: boolean
    id?: string
  }>
> = ({ children, isVisible, className, id }) => (
  <ul
    id={id}
    className={cn(styles.popup, isVisible && styles.visible, className)}
  >
    {children}
  </ul>
)

export const NavPopup: React.FC<
  IPopupProps & {
    id?: string
    items: Array<{ label: string; href: string }>
    analyticsKey: string
    onNavigate?: () => void
  }
> = ({ id, items, analyticsKey, isVisible, closePopup, onNavigate }) => (
  <BasePopup id={id} className={styles.navPopup} isVisible={isVisible}>
    {items.map(({ label, href }, i) => (
      <li key={i}>
        <Link
          className={styles.link}
          href={href}
          onClick={(): void => {
            logEvent('Nav', { Item: analyticsKey })
            closePopup()
            onNavigate?.()
          }}
        >
          {label}
        </Link>
      </li>
    ))}
  </BasePopup>
)
